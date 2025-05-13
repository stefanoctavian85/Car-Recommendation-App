import joblib
import numpy as np
from flask import Flask, request, jsonify
import pandas as pd

app = Flask(__name__)

model_chatbot = joblib.load("./chatbot/joblib_files/model_ML.joblib")
vectorizer = joblib.load("./chatbot/joblib_files/tfidf_vectorizer.joblib")

model_recommendation = joblib.load("./car-recommendation/joblib_files/model_ML.joblib")
label_encoder_bodytype = joblib.load("./car-recommendation/joblib_files/labelencoder_Tip Caroserie.joblib")
label_encoder_fueltype = joblib.load("./car-recommendation/joblib_files/labelencoder_Combustibil.joblib")
label_encoder_transmission = joblib.load("./car-recommendation/joblib_files/labelencoder_Transmisie.joblib")
label_encoder_gearbox = joblib.load("./car-recommendation/joblib_files/labelencoder_Cutie de viteze.joblib")
label_encoder_car = joblib.load("./car-recommendation/joblib_files/labelencoder_y.joblib")
standard_scaler = joblib.load("./car-recommendation/joblib_files/standardscaler.joblib")

@app.route('/chatbot/categorize', methods=['POST'])
def categorize():
    data = request.get_json()
    message = data.get('message')
    transformed_reply = vectorizer.transform([message])
    predicted_category = model_chatbot.predict(transformed_reply)
    return jsonify({"category": predicted_category[0]})


@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
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

    df['Combustibil'] = label_encoder_fueltype.transform(df['Combustibil'])
    df['Tip Caroserie'] = label_encoder_bodytype.transform(df['Tip Caroserie'])
    df['Cutie de viteze'] = label_encoder_gearbox.transform(df['Cutie de viteze'])
    df['Transmisie'] = label_encoder_transmission.transform(df['Transmisie'])

    numeric_responses = ['Anul productiei', 'Capacitate cilindrica', 'Putere', 'Consum Urban', 'Consum Extraurban', 'Pret']
    categoric_responses = ['Combustibil', 'Tip Caroserie', 'Cutie de viteze', 'Transmisie']

    scaled_responses = standard_scaler.transform(df[numeric_responses])
    final_responses = np.hstack([scaled_responses, df[categoric_responses]])
    
    predictions = model_recommendation.predict_proba(final_responses)[0]
    predictions = np.argsort(predictions)[::-1][:3]
    predictions = predictions.ravel()
    predictions = label_encoder_car.inverse_transform(predictions).tolist()
    return jsonify(predictions)


if __name__ == '__main__':
    app.run(debug=True)
