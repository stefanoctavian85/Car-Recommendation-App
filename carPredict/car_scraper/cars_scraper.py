import time
import pandas as pd
import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

website = "https://www.autovit.ro/autoturisme"
load_dotenv(dotenv_path=".env")
path = os.getenv("CHROMEDRIVER_PATH")

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument('--incognito')
options.add_argument("start-maximized")
options.add_argument("disable-infobars")
options.add_argument('--no-sandbox')
options.add_argument('--disable-application-cache')
options.page_load_strategy = 'eager'
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
service = Service(path)

driver = webdriver.Chrome(service=service, options=options)
driver.get(website)

time.sleep(1)

accept_button = driver.find_element(By.ID, "onetrust-accept-btn-handler")
accept_button.click()

data_links = []

def extract_car_links():
    page_number = 0
    while True:
        try:
            cars_paragraphs = driver.find_elements(By.CSS_SELECTOR, "article.ooa-16cop2i.e1oaf45v0")

            for car in cars_paragraphs:
                link = car.find_element(By.TAG_NAME, "a").get_attribute("href")
                data_links.append(link)

            try:
                next_page_button = WebDriverWait(driver, 5).until(EC.presence_of_element_located((By.XPATH, '//li[@title="Go to next Page"]')))
                if "disabled" in next_page_button.get_attribute("class"):
                    break

                driver.execute_script("arguments[0].click();", next_page_button)
                page_number = page_number + 1
                print("Page number" + str(page_number))
            except Exception:
                print("No more pages!")
                break
        except Exception:
            break
    
    return data_links

def extract_car_details(data_links):
    number = 0
    car_data_list = []
    for link in data_links:
        try:
            driver.get(link)
            car_info = {}

            technical_specs_button = WebDriverWait(driver, 3).until(EC.presence_of_element_located((By.CSS_SELECTOR, "header.ooa-1g1u77j")))
            technical_specs_button.click()

            try:
                tags = WebDriverWait(driver, 3).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "p.en2sar58.ooa-y26jp")))
                details = WebDriverWait(driver, 3).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "p.en2sar59.ooa-17xeqrd")))

                pozitie = 0

                for tag in tags:
                    eticheta = tag.text.strip()

                    if eticheta == "VIN (serie sasiu)":
                        continue

                    if pozitie < len(details):
                        car_info[eticheta] = details[pozitie].text.strip()
                        pozitie += 1

                car_info["KM"] = driver.find_element(By.CSS_SELECTOR, "p.e1btp7412.ooa-1rcllto").text.strip()

                pret = driver.find_element(By.CSS_SELECTOR, "h3.offer-price__number.ex6ng1i5.ooa-1kdys7g")
                moneda = driver.find_element(By.CSS_SELECTOR, "p.offer-price__currency.ex6ng1i6.ooa-m6bn4u")
                car_info["Pret"] = pret.text.strip() + moneda.text.strip()

                try:
                    equipments = WebDriverWait(driver, 3).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "p.eunhvho3.ooa-1afepcx")))
                    car_info["Dotari"] = [equip.text.strip() for equip in equipments]
                except Exception:
                    print("Equipment not found!")

                try:
                    images = WebDriverWait(driver, 5).until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.embla__slide.ooa-4g6ai3.e142atj32 img")))
                    car_info["Imagine"] = ', '.join(img.get_attribute("srcset").split(',')[0].split(" ")[0] for img in images)
                except Exception:
                    print("Image not found!")

                print(f"Car number {number}")
                number = number + 1
                car_data_list.append(car_info)
            except Exception as e:
                print("No specification for this car", e)

        except Exception:
            print("Eroare")
    return car_data_list

data_links = extract_car_links()
data_links_df = pd.DataFrame(data_links, columns=['Link'])
data_links_df.index.name = "Masina"
data_links_df.to_csv("raw/cars_links.csv")

data_links_df = pd.read_csv("raw/cars_links.csv", index_col=0)
cars = extract_car_details(data_links_df["Link"].tolist())
car_data_df = pd.DataFrame(cars)
car_data_df.to_csv("raw/cars_dataset.csv", index=False)