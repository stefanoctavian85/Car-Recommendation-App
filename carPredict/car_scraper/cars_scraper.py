import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

website = "https://www.autovit.ro/autoturisme?page=1"

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
service = Service(ChromeDriverManager().install())

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
            cars_paragraphs = driver.find_elements(By.CSS_SELECTOR, "article.ooa-16cop2i.eg9746i0")

            for car in cars_paragraphs:
                link = car.find_element(By.TAG_NAME, "a").get_attribute("href")
                if not existing_data_links['Link'].str.contains(link).any():
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
                tags = WebDriverWait(driver, 3).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "p.ekwurce8.ooa-1vfan6r")))
                details = WebDriverWait(driver, 3).until(EC.presence_of_all_elements_located((By.CSS_SELECTOR, "p.ekwurce9.ooa-10u0vtk")))

                position = 0

                for tag in tags:
                    if tag.text.strip() == "VIN (serie sasiu)" or tag.text.strip() == "":
                        continue

                    if position < len(details):
                        car_info[tag.text.strip()] = details[position].text.strip()
                        position += 1

                car_info["KM"] = driver.find_element(By.CSS_SELECTOR, "p.ez0zock2.ooa-11fwepm").text.strip()

                price = driver.find_element(By.CSS_SELECTOR, "span.offer-price__number")
                currency = driver.find_element(By.CSS_SELECTOR, "span.offer-price__currency.ewf7bkd5.ooa-17squvz")
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
                                equipment_items = equipment_container.find_elements(By.CSS_SELECTOR, "div.ooa-1k83q4c.e1jq34to2 > p.e1jq34to3.ooa-1hoe3s8")
                                for item in equipment_items:
                                    if equip.text.strip() != '':
                                        equipment.append(item.text.strip())
                            car_info[equip.text.strip()] = equipment
                except Exception:
                    print("Equipment not found!")

                try:
                    images = WebDriverWait(driver, 5).until(
                        EC.presence_of_all_elements_located((By.CSS_SELECTOR, "div.embla__container img")))
                    car_info["Imagine"] = ', '.join(img.get_attribute("srcset").split(',')[0].split(" ")[0] for img in images)
                except Exception:
                    print("Image not found!")

                print(f"Car number {number}")
                number = number + 1
                car_data_list.append(car_info)
            except Exception as e:
                print("No specification for this car", e)

        except Exception as e:
            print("Eroare", e)
    return car_data_list

existing_data_links = pd.read_csv("raw/cars_links.csv", index_col=0)
new_data_links = extract_car_links()
new_data_links_df = pd.DataFrame(new_data_links, columns=['Link'])
new_data_links_df.index.name = "Masina"
all_data_links = pd.concat([existing_data_links, new_data_links_df]).reset_index(drop=True)
all_data_links.index.name = "Masina"
all_data_links.to_csv("raw/cars_links.csv")

data_links_df = pd.read_csv("raw/cars_links.csv", index_col=0)
existing_cars_dataset = pd.read_csv("raw/cars_dataset.csv")
cars = extract_car_details(data_links_df["Link"])
car_data_df = pd.DataFrame(cars)
print(car_data_df)
all_cars = pd.concat([existing_cars_dataset, car_data_df])
all_cars.to_csv("raw/cars_dataset.csv", index=False)