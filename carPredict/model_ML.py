import joblib
import numpy as np
from flask import Flask, request, jsonify

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
    numeric_responses = []
    transformed_responses = []
    for i, col in enumerate(responses):
        if i == 3:
            transformed_responses.append(label_encoder_gearbox.transform([col])[0])
        elif i == 4:
            transformed_responses.append(label_encoder_bodytype.transform([col])[0])
        elif i == 5:
            transformed_responses.append(label_encoder_fueltype.transform([col])[0])
        elif i == 6:
            transformed_responses.append(label_encoder_transmission.transform([col])[0])
        else:
            numeric_responses.append(col)

    numeric_responses = np.array(numeric_responses).reshape(1, -1)
    numeric_responses = standard_scaler.transform(numeric_responses)

    transformed_responses = np.concatenate([transformed_responses, numeric_responses.flatten()])
    transformed_responses = np.array(transformed_responses).reshape(1, -1)

    predictions = model_recommendation.predict_proba(transformed_responses)
    predictions = np.argsort(predictions, axis=1)[:, -3:]
    predictions = np.sort(predictions)
    predictions = predictions.ravel()
    predictions = label_encoder_car.inverse_transform(predictions).tolist()
    return jsonify(predictions)


if __name__ == '__main__':
    app.run(debug=True)
