# No hardware resources for it :(

from transformers import PaliGemmaForConditionalGeneration, PaliGemmaProcessor
import torch
import re
from pydantic import BaseModel
from flask import request, jsonify
from PIL import Image
from concurrent.futures import ThreadPoolExecutor

model_id = "google/paligemma2-3b-pt-224"
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

model = PaliGemmaForConditionalGeneration.from_pretrained(model_id, torch_dtype=torch.float16, device_map="auto",
                                                          low_cpu_mem_usage=True).eval()
processor = PaliGemmaProcessor.from_pretrained(model_id, use_fast=True)

def parse_driver_license(text):
    last_name = re.search(r"1\.\s*([A-Za-z]+)", text)
    first_name = re.search(r"2\.\s*([A-Za-z]+)", text)
    start_date = re.search(r"4a\.\s*([\d.]+)", text)
    end_date = re.search(r"4b\.\s*([\d.]+)", text)

    return UserDriverLicense(
        first_name=first_name.group(1) if first_name else "",
        last_name=last_name.group(1) if last_name else "",
        start_date=start_date.group(1) if start_date else "",
        end_date=end_date.group(1) if end_date else "",
    )

class UserDriverLicense(BaseModel):
    first_name: str
    last_name: str
    start_date: str
    end_date: str

def parse_identity_card(text):
    lines = text.splitlines()

    first_name, first_name2, last_name, last_name2 = "", "", "", ""

    for i, line in enumerate(lines):
        if not last_name and re.search(r"Nume|Nom|Last\s*Name", line, re.IGNORECASE):
            last_name = lines[i+1].strip()
        elif not first_name and re.search(r"Prenume|Prenom|First\s*Name", line, re.IGNORECASE):
            first_name = lines[i+1].strip()
        elif not last_name2 or not first_name2:
            match = re.search(r"IDROU([A-Z<]+)<+([A-Z<]+)<([A-Z<]+)", line)
            if match:
                last_name2 = match.group(1).replace("<", "").strip()
                first_name2 = match.group(2).replace("<", "").strip()

    return UserIDCard(
        first_name=first_name if first_name else "",
        last_name=last_name if last_name else "",
        first_name2=first_name2 if first_name2 else "",
        last_name2=last_name2 if last_name2 else ""
    )

class UserIDCard(BaseModel):
    first_name: str
    last_name: str
    first_name2: str
    last_name2: str


prompt = "<image>ocr"

def ocr_service(image, is_id_card):
    model_inputs = processor(text=prompt, images=image, return_tensors="pt").to(torch.float16).to(device)
    input_len = model_inputs["input_ids"].shape[-1]
    print("test")
    with torch.inference_mode():
        generation = model.generate(**model_inputs, max_new_tokens=200, do_sample=False)
        generation = generation[0][input_len:]
        decoded = processor.decode(generation, skip_special_tokens=True)
        if is_id_card:
            user_identity_info = parse_identity_card(decoded)
            return user_identity_info
        else:
            driver_license_info = parse_driver_license(decoded)
            return driver_license_info


# @app.route('/validate-documents', methods=['POST'])
def validate_documents():
    try:
        data = request.get_json()

        id_card_path = data.get('idCardPath')
        driver_license_path = data.get('driverLicensePath')

        id_card_image = Image.open(id_card_path).resize((224, 224))
        driver_license_image = Image.open(driver_license_path).resize((224, 224))

        with ThreadPoolExecutor() as executor:
            future_id_card = executor.submit(ocr_service, id_card_image, True)
            future_driver_license = executor.submit(ocr_service, driver_license_image, False)

            user_info = future_id_card.result()
            driver_info = future_driver_license.result()


        return jsonify({
            "idCard": user_info.dict(),
            "driverLicense": driver_info.dict(),
        })
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error, please try again later."}), 500
