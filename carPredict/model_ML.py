import joblib
import numpy as np
from flask import Flask, request, jsonify
import pandas as pd
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field
from typing import Literal, Optional
from flask_cors import CORS
import json
import easyocr
from PIL import Image
import unicodedata

app = Flask(__name__)
CORS(app)

model_chatbot = joblib.load("./chatbot/joblib_files/model_ML.joblib")
vectorizer = joblib.load("./chatbot/joblib_files/tfidf_vectorizer.joblib")

model_recommendation = joblib.load("./car-recommendation/joblib_files/model_ML.joblib")
label_encoder_bodytype = joblib.load("./car-recommendation/joblib_files/labelencoder_Tip Caroserie.joblib")
label_encoder_fueltype = joblib.load("./car-recommendation/joblib_files/labelencoder_Combustibil.joblib")
label_encoder_transmission = joblib.load("./car-recommendation/joblib_files/labelencoder_Transmisie.joblib")
label_encoder_gearbox = joblib.load("./car-recommendation/joblib_files/labelencoder_Cutie de viteze.joblib")
label_encoder_car = joblib.load("./car-recommendation/joblib_files/labelencoder_y.joblib")
standard_scaler = joblib.load("./car-recommendation/joblib_files/standardscaler.joblib")
onehotencoder = joblib.load("./car-recommendation/joblib_files/onehotencoder.joblib")
kprototypes = joblib.load("./car-recommendation/joblib_files/kprototypes_clustering.joblib")

mean_mode_values_df = pd.read_csv("./car-recommendation/processed_data/mean_mode_values.csv")
numerical_columns = ['Anul productiei', 'Capacitate cilindrica', 'Putere', 'Consum Urban', 'Consum Extraurban', 'Pret']
categorical_columns = ['Combustibil', 'Tip Caroserie', 'Cutie de viteze', 'Transmisie']
all_columns = numerical_columns + categorical_columns

prompt_template = ("Please extract car attributes from the text below. \n"
                   "If the value is explicitly mentionated, extract it as is. \n" 
                   "If it isn't mentioned, please return null. Do not guess or infer values. \n"
                   "If you have something like 'year of production 2024', you must return in the JSON the value for 'Anul productiei' to be 2024 in integer. Same for expressions like 'year', 'production year' etc \n"
                   "If you have something like 'engine capacity 2000', you must return in the JSON the value for 'Capacitate cilindrica' to be 2000 in integer. Same for expressions like 'cylidrincal capacity' etc. \n" \
                   "If you have something like 'horsepower 200', you must return in the JSON the value for 'Putere' to be 200 in integer. \n"
                   "If you see something like 'sedan', 'compact', 'minivan', 'sport', or 'SUV' it reffers to the 'Tip Caroserie' attribute \n"
                   "Each field must contain a single value! \n"
                   "You must return a JSON in the following format: \n"
                   "{format_instructions} \n"
                   "Text: {text}. \n"
                   "No explanations! Only return the JSON. \n"
                   "The user input will be in english, please correlate with the pydantic format instructions. "
                   "The returned JSON must have all the keys, with the value if user mentioned it, or null if not. \n"
                   )


class Masina(BaseModel):
    anul_productiei: Optional[int] = Field(None, alias="Anul productiei")
    capacitate_cilindrica: Optional[int] = Field(None, alias="Capacitate cilindrica")
    Putere: Optional[int]
    consum_urban: Optional[int] = Field(None, alias="Consum Urban")
    consum_extraurban: Optional[int] = Field(None, alias="Consum Extraurban")
    Pret: Optional[int]
    Combustibil: Optional[Literal['Diesel', 'Electric', 'Gasoline', 'Hibrid']]
    tip_caroserie: Optional[Literal['Compact', 'Minivan', 'Sedan', 'Sport', 'SUV']] = Field(None, alias="Tip Caroserie")
    cutie_viteze: Optional[Literal['Manual', 'Automatic']] = Field(None, alias='Cutie de viteze')
    Transmisie: Optional[Literal['FWD', 'RWD', 'AWD']]


@app.route('/transform-text-to-json', methods=['POST'])
def text_to_json():
    try:
        data = request.get_json()
        
        if not data or "text" not in data:
            return jsonify({"error": "Text is required!"}), 400

        text = data.get('text')

        parser = PydanticOutputParser(pydantic_object=Masina)
        format_instructions = parser.get_format_instructions()

        prompt = PromptTemplate(
            template=prompt_template,
            input_variables=["text"],
            partial_variables={"format_instructions": format_instructions},
        )

        chat = ChatOllama(
            model="llama3.2:3b",
            temperature=0,
            format='json'
        )

        final_prompt = prompt.format(text=text)
        response = chat.invoke(final_prompt)

        try:
            llm_response = json.loads(response.content)
        except json.JSONDecodeError:
            return jsonify({"error": "Model response could not be parsed! Please try another method of recommendation!"}), 500
        
        car_info = llm_response.get('properties')

        if car_info is None:
            return jsonify({"error": "Invalid structure returned by the model! Please try another method of recommendation!"}), 500
        
        for key in car_info:
            val = car_info[key]
            if car_info[key] == "null":
                car_info[key] = None
            elif key in numerical_columns and isinstance(val, str) and val.isdigit():
                car_info[key] = int(val)
        
        nr_valid_fields = sum(1 for value in car_info.values() if value is not None)

        if nr_valid_fields < 3:
            return jsonify({"error": "Too few details provided. The recommendation would be too general!"}), 400

        for key in car_info:
            if car_info[key] is None:
                row = mean_mode_values_df[mean_mode_values_df['Column'] == key]

                if not row.empty:
                    value = row['Mean/Mode'].iloc[0]

                    if key in numerical_columns:
                        car_info[key] = int(float(value))
                    else:
                        car_info[key] = value

        return jsonify({
            "content": json.dumps(car_info),
        })
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error, please try again later."}), 500


@app.route('/chatbot/categorize', methods=['POST'])
def categorize():
    try:
        data = request.get_json()

        if not data or "message" not in data or not isinstance(data["message"], str):
            return jsonify({"error": "Invalid message input"}), 400

        message = data.get('message')
        transformed_reply = vectorizer.transform([message])
        predicted_category = model_chatbot.predict(transformed_reply)
        return jsonify({"category": predicted_category[0]})
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error, please try again later."}), 500


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is empty!" }), 400

        if 'responses' in data:
            responses = np.array(data['responses'])

            if not isinstance(responses, (list, tuple, np.ndarray)) or len(responses) != 10:
                return jsonify({"error": "Responses are not a list, tuple or ndarray or are not 10!"}), 400

            df = pd.DataFrame([{
                'Anul productiei': int(responses[0]),
                'Capacitate cilindrica': int(responses[1]),
                'Putere': int(responses[2]),
                'Cutie de viteze': responses[3],
                'Tip Caroserie': responses[4],
                'Combustibil': responses[5],
                'Transmisie': responses[6],
                'Pret': int(responses[7]),
                'Consum Urban': int(responses[8]),
                'Consum Extraurban': int(responses[9]),
            }])
        elif 'content' in data:
            car_data = data['content']
            missing_keys = [key for key in all_columns if key not in car_data]

            if missing_keys:
                return jsonify({"error": "Missing keys from text to json!"}), 400
            
            for key in numerical_columns:
                val = car_data.get(key)
                if not isinstance(val, (int, float)):
                    return jsonify({"error": f"Value for {key} must be a number"}), 400
                
            for key in categorical_columns:
                val = car_data.get(key)
                if not isinstance(val, str):
                    return jsonify({"error": f"Value for {key} must be a string"}), 400

            df = pd.DataFrame([{
                'Anul productiei': car_data['Anul productiei'],
                'Capacitate cilindrica': car_data['Capacitate cilindrica'],
                'Putere': car_data['Putere'],
                'Cutie de viteze': car_data['Cutie de viteze'],
                'Tip Caroserie': car_data['Tip Caroserie'],
                'Combustibil': car_data['Combustibil'],
                'Transmisie': car_data['Transmisie'],
                'Pret': car_data['Pret'],
                'Consum Urban': car_data['Consum Urban'],
                'Consum Extraurban': car_data['Consum Extraurban'],
            }])
        else:
            return jsonify({"error": "Missing recommendation responses! Please try again later!" }), 500

        # df['Combustibil'] = label_encoder_fueltype.transform(df['Combustibil'])
        # df['Tip Caroserie'] = label_encoder_bodytype.transform(df['Tip Caroserie'])
        # df['Cutie de viteze'] = label_encoder_gearbox.transform(df['Cutie de viteze'])
        # df['Transmisie'] = label_encoder_transmission.transform(df['Transmisie'])

        scaled_responses = pd.DataFrame(standard_scaler.transform(df[numerical_columns]), columns=numerical_columns)

        # Clustering
        responses_for_clustering = pd.concat([scaled_responses, df[categorical_columns]], axis=1)
        categorical_columns_index = [responses_for_clustering.columns.get_loc(column) for column in categorical_columns]

        cluster = kprototypes.predict(responses_for_clustering.to_numpy(dtype=object), categorical=categorical_columns_index)

        # Predicting
        # responses_cat = pd.DataFrame(df[categorical_columns], columns=categorical_columns)
        responses_cat = pd.DataFrame(onehotencoder.transform(df[categorical_columns]).toarray(),
                                     columns=onehotencoder.get_feature_names_out(categorical_columns)).reset_index(drop=True)
        final_responses = pd.concat([scaled_responses, responses_cat], axis=1)
        predictions = model_recommendation.predict_proba(final_responses)[0]
        predictions = np.argsort(predictions)[::-1][:3]
        predictions = predictions.ravel()
        predictions = label_encoder_car.inverse_transform(predictions).tolist()
        return jsonify({
            "cluster": int(cluster[0]),
            "cars": predictions
        })
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error, please try again later."}), 500

prompt_OCR = ("I have extracted the following text with an OCR from identity card and driver license.\n"
              "Text extracted from ID Card: {full_text_ID}\n"
              "Text extracted from driver license: {full_text_driver}\n"
              "The user provided in the app the following:\n"
              "Last name: {last_name}, First name: {first_name}\n"
              "Your task is to compare the provided names to the OCR-extracted names and calculate a similarity score.\n"
              "STEP BY STEP PROCESS:\n"
              "1. From the OCR extracted text, even if no perfect match is found, try partial matches and assign a score using the rules below. \n" 
              "2. Calculate similarity score for each name using the scoring system: \n"
              "SCORING CRITERIA (be precise):\n"
              "For each name, assign points based on best match found:\n"
              "- EXACT MATCH (ignoring diacritics ăâîșț): 100 points\n"
              "- 1-2 character difference: 85-95 points, example: Stef vs Stefan, there are 2 characters difference\n"
              "- 3-4 character difference: 70-80 points, example: St vs Stefan, there are 4 characters difference\n"
              "- 5-6 character difference: 50-65 points\n"
              "- More than 6 character difference: 20-45 points\n"
              "- Name not found at all: 0 points - example: Andrei vs Stefan, there are no similarities\n\n" 
              "- Diacritics, like Ă, Ș, Ț, Â, Î,  must be ignored - treat Ștefan like Stefan\n"
              "3. Validation: if final score >= 50, then isValid is true, otherwise false\n"
              "4. Return the JSON in the following structure: {format_instructions_ocr}!\n" 
              "5. FINAL INSTRUCTIONS:\n"
              "Return ONLY a single JSON object, and nothing else.\n"
              "Do NOT return explanations, do NOT return schema, do NOT return lists.\n"
              "Return STRICTLY the JSON object in the above format, with only the score and isValid keys.\n\n"
              )

def strip_accents(text):
    return ''.join(
        c for c in unicodedata.normalize('NFD', text) if unicodedata.category(c) != 'Mn'
    )

threshold = 0.3
class UserIdentity(BaseModel):
    score: int
    isValid: bool

reader = easyocr.Reader(['ro', 'en'])

@app.route('/validate-documents', methods=['POST'])
def validate_documents():
    try:
        data = request.get_json()

        if not data:
            return jsonify({"error": "Request body is empty!" }), 400
        
        id_card_path = data.get('idCardPath')
        driver_license_path = data.get('driverLicensePath')
        first_name = data.get('firstname')
        last_name = data.get('lastname')

        parser = PydanticOutputParser(pydantic_object=UserIdentity)
        format_instructions_ocr = parser.get_format_instructions()

        if not all([id_card_path, driver_license_path, first_name, last_name]):
            return jsonify({"error": "Missing one or more fields: id card, driver license, first name or last name "}), 400

        try:
            identity_card_photo = Image.open(id_card_path).convert("RGB")
            identity_card_photo = identity_card_photo.resize((identity_card_photo.width * 3, identity_card_photo.height * 3))
            identity_card_photo = np.array(identity_card_photo)
        except Exception as e:
            return jsonify({"error": "ID card OCR failed!"}), 500

        try:
            driver_license_photo = Image.open(driver_license_path).convert("RGB")
            driver_license_photo = driver_license_photo.resize((driver_license_photo.width * 3, driver_license_photo.height * 3))
            driver_license_photo = np.array(driver_license_photo)
        except Exception as e:
            return jsonify({"error": "Driver license OCR failed!"}), 500

        try:
            result_ID = reader.readtext(identity_card_photo)
            result_driver_license = reader.readtext(driver_license_photo)
        except Exception as e:
            print(e)
            return jsonify({"error": "OCR failed!"}), 500

        full_text_ID = "ID CARD INFO: " + strip_accents(" ".join(text for (_, text, prob) in result_ID if prob > threshold))
        full_text_driver = "DRIVER LICENSE INFO: " + strip_accents(" ".join(text for (_, text, prob) in result_driver_license if prob > threshold))

        prompt = PromptTemplate(
            template=prompt_OCR,
            input_variables=["full_text_ID", "full_text_driver", "first_name", "last_name"],
            partial_variables={"format_instructions_ocr": format_instructions_ocr},
        )

        chat = ChatOllama(
            model="llama3.2:3b",
            temperature=0,
            format='json'
        )

        final_prompt = prompt.format(
            full_text_ID=full_text_ID,
            full_text_driver=full_text_driver,
            first_name=first_name,
            last_name=last_name
        )
        
        response = chat.invoke(final_prompt)
        try:
            user_identity_score = json.loads(response.content)
        except json.JSONDecodeError:
            return jsonify({"error": "Failed to parse response JSON"}), 500

        return jsonify({
            "content": json.dumps(user_identity_score),
        })
    except Exception as e:
        print(e)
        return jsonify({"error": "Internal Server Error, please try again later."}), 500

if __name__ == '__main__':
    app.run(debug=False)
