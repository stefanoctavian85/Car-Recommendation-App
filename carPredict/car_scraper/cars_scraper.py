import time
import pandas as pd
import os
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

website = "https://www.autovit.ro/autoturisme?page=1"
load_dotenv(dotenv_path=".env")
path = os.getenv("CHROMEDRIVER_PATH")

options = webdriver.ChromeOptions()
options.add_argument("--headless=new")
options.add_argument("--incognito")
options.add_argument("--disable-gpu")
options.add_argument("start-maximized")
options.add_argument("disable-infobars")
options.add_argument("--no-sandbox")
options.add_argument("--enable-unsafe-swiftshader")
options.add_argument("--disable-application-cache")
options.page_load_strategy = "eager"
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36")
service = Service(path)

driver = webdriver.Chrome(service=service, options=options)
driver.get(website)

time.sleep(3)

accept_button = driver.find_element(By.ID, "onetrust-accept-btn-handler")
accept_button.click()

data_links = []

def extract_car_links():
    page_number = 1
    while True:
        try:
            cars_paragraphs = driver.find_elements(By.CSS_SELECTOR, "article.ooa-16cop2i.e1oaf45v0")

            for car in cars_paragraphs:
                link = car.find_element(By.TAG_NAME, "a").get_attribute("href")
                data_links.append(link)

            page_number = page_number + 1
            print("Page number " + str(page_number))
            driver.get(f"https://www.autovit.ro/autoturisme?page={page_number}")
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

                position = 0

                for tag in tags:
                    if tag.text.strip() == "VIN (serie sasiu)" or tag.text.strip() == "":
                        continue

                    if position < len(details):
                        car_info[tag.text.strip()] = details[position].text.strip()
                        position += 1

                car_info["KM"] = driver.find_element(By.CSS_SELECTOR, "p.es32mkf2.ooa-1rcllto").text.strip()

                price = driver.find_element(By.CSS_SELECTOR, "h3.offer-price__number.ex6ng1i5.ooa-1kdys7g")
                currency = driver.find_element(By.CSS_SELECTOR, "p.offer-price__currency.ex6ng1i6.ooa-m6bn4u")
                car_info["Pret"] = price.text.strip() + currency.text.strip()

                try:
                    equipment_headers = driver.find_elements(By.CSS_SELECTOR, "div.ooa-36x1jq > header.ooa-1g1u77j")
                    start_index = next((i for i, header in enumerate(equipment_headers) if "Audio si tehnologie" in header.text), None)
                    if start_index is None:
                        print("Equipment not found!")
                    else: 
                        equipment_headers = equipment_headers[start_index:]
                        for equip in equipment_headers:
                            if equip.text.strip() != '':
                                equipment = []
                                arrow = equip.find_element(By.CSS_SELECTOR, "svg.ooa-51p4fw")
                                arrow_path = arrow.find_element(By.TAG_NAME, "path").get_attribute("d")
                                
                                if 'M2.001 6.5h' in arrow_path:
                                    equip.click()
                                    time.sleep(0.5)

                                equipment_container = equip.find_element(By.XPATH, "./following-sibling::div[1]")
                                equipment_items = equipment_container.find_elements(By.CSS_SELECTOR, "div.ooa-1k83q4c.eunhvho2 > p.eunhvho3.ooa-1afepcx")
                                for item in equipment_items:
                                    if equip.text.strip() != '':
                                        equipment.append(item.text.strip())
                            car_info[equip.text.strip()] = equipment
                except Exception:
                    print("Equipment not found!")

                try:
                    images = WebDriverWait(driver, 5).until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.embla__slide.ooa-4g6ai3.em169ow2 img")))
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
data_links_df.to_csv("raw/test_links.csv")

data_links_df = pd.read_csv("raw/cars_links.csv", index_col=0)
cars = extract_car_details(data_links_df["Link"].tolist())
car_data_df = pd.DataFrame(cars)
car_data_df.to_csv("raw/cars_dataset.csv", index=False)