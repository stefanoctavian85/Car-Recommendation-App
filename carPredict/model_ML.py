import joblib
import numpy as np
from flask import Flask, request, jsonify
import pandas as pd
from langchain.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field
from typing import Literal
from flask_cors import CORS
import json
import easyocr
from PIL import Image

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

prompt_template = ("You are a car recommendation assistant! Please, extract car attributes, where NA, please put null."
                   "Each field must contain a single value! You must return a JSON!\n"
                   "{format_instructions}\n"
                   "Text: {text}.")


class Masina(BaseModel):
    anul_productiei: int = Field(..., alias="Anul productiei")
    capacitate_cilindrica: int = Field(..., alias="Capacitate cilindrica")
    Putere: int
    consum_urban: int = Field(..., alias="Consum Urban")
    consum_extraurban: int = Field(..., alias="Consum Extraurban")
    Pret: int
    Combustibil: Literal['Diesel', 'Electric', 'Gasoline', 'Hibrid']
    tip_caroserie: Literal['Compact', 'Minivan', 'Sedan', 'Sport', 'SUV'] = Field(..., alias="Tip Caroserie")
    cutie_viteze: Literal['Manual', 'Automatic'] = Field(..., alias='Cutie de viteze')
    Transmisie: Literal['FWD', 'RWD', 'AWD']


@app.route('/transform-text-to-json', methods=['POST'])
def text_to_json():
    data = request.get_json()
    text = data.get('text')

    parser = PydanticOutputParser(pydantic_object=Masina)
    format_instructions = parser.get_format_instructions()

    prompt = PromptTemplate(
        template=prompt_template,
        input_variables=["text"],
        partial_variables={"format_instructions": format_instructions},
    )

    chat = ChatOllama(
        model="llama3.1",
        temperature=0,
        format="json"
    )
    final_prompt = prompt.format(text=text)
    response = chat.invoke(final_prompt)
    car_info = json.loads(response.content)

    for key in car_info:
        if car_info[key] is None and key != 'Masina':
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


@app.route('/chatbot/categorize', methods=['POST'])
def categorize():
    data = request.get_json()
    message = data.get('message')
    transformed_reply = vectorizer.transform([message])
    predicted_category = model_chatbot.predict(transformed_reply)
    return jsonify({"category": predicted_category[0]})


@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        if 'responses' in data:
            responses = np.array(data['responses'])
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
              "This text may contain errors, such as misspelled letters, missing characters, or incorrect spacing.\n"
              "Text extracted from ID Card: {full_text_ID}\n"
              "Text extracted from driver license: {full_text_driver}\n"
              "The user provided in the app the following:\n"
              "Last name: {last_name}, First name: {first_name}\n"
              "Your task is to compare the provided names to the OCR-extracted names and calculate a similarity score.\n"
              "STEP BY STEP PROCESS:\n"
              "1. Identify potential matches in the OCR text for both first name and last name\n"
              "2. Calculate similarity score for each name using the scoring system: \n"
              " - Perfect match (100 points): Names are identical\n"
              " - Near perfect (90-99 points): 1-2 characters differences (OCR errors like Ă vs A)\n"
              " - Good match (70-89 points): 3-4 characters differences or minor variations\n"
              " - Partial match (50-69 points): Names are recognizable but with several differences\n"
              " - Poor match (30-49 points): Some similarity but significat differences\n"
              " - No match (0-29 points): Names are completely different\n"
              "3. IMPORTANT! DO NOT TRY to match different names! Stefan is NOT similar to ANDREI\n"
              "4. Combine scores: average the first name score and last name score to get final score\n"
              "5. Validation: if final score >= 50, then isValid is true, otherwise false\n"
              "EXAMPLES: \n"
              "STEFAN vs stefan = 100 points (perfect match)\n"
              "Stef vs stefan = 90 points (2 characters)\n"
              "Andrei vs text without `Andrei` = 0 points (names are completely different)\n"
              "You must return a JSON with the following structure:\n"
              "{format_instructions}"
              )

threshold = 0.5
class UserIdentity(BaseModel):
    score: int
    isValid: bool

reader = easyocr.Reader(['ro', 'en'])

@app.route('/validate-documents', methods=['POST'])
def validate_documents():
    data = request.get_json()

    id_card_path = data.get('idCardPath')
    driver_license_path = data.get('driverLicensePath')

    identity_card_photo = Image.open(id_card_path).convert("RGB")
    identity_card_photo = identity_card_photo.resize((identity_card_photo.width * 3, identity_card_photo.height * 3))
    identity_card_photo = np.array(identity_card_photo)

    driver_license_photo = Image.open(driver_license_path).convert("RGB")
    driver_license_photo = driver_license_photo.resize((driver_license_photo.width * 3, driver_license_photo.height * 3))
    driver_license_photo = np.array(driver_license_photo)

    first_name = data.get('firstname')
    last_name = data.get('lastname')

    result_ID = reader.readtext(identity_card_photo)
    result_driver_license = reader.readtext(driver_license_photo)

    full_text_ID = "ID CARD INFO: " + " ".join(text for (_, text, prob) in result_ID if prob > threshold)
    full_text_driver = "DRIVER LICENSE INFO: " + " ".join(text for (_, text, prob) in result_driver_license if prob > threshold)

    parser = PydanticOutputParser(pydantic_object=UserIdentity)
    format_instructions = parser.get_format_instructions()

    prompt = PromptTemplate(
        template=prompt_OCR,
        input_variables=["full_text_ID", "full_text_driver", "first_name", "last_name"],
        partial_variables={"format_instructions": format_instructions},
    )

    chat = ChatOllama(
        model="llama3.1",
        temperature=0,
        format="json"
    )

    final_prompt = prompt.format(
        full_text_ID=full_text_ID,
        full_text_driver=full_text_driver,
        first_name=first_name,
        last_name=last_name
    )

    response = chat.invoke(final_prompt)
    user_identity_score = json.loads(response.content)
    return jsonify({
        "content": json.dumps(user_identity_score),
    })

if __name__ == '__main__':
    app.run(debug=False, use_reloader=False)
