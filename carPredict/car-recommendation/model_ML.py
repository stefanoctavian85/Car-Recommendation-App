import joblib
import numpy as np
from flask import Flask, request, jsonify

app = Flask(__name__)

model = joblib.load("joblib_files/model_ML.joblib")
label_encoder_culoare = joblib.load("joblib_files/labelencoder_Culoare.joblib")
label_encoder_combustibil = joblib.load("joblib_files/labelencoder_Combustibil.joblib")
label_encoder_cutie_viteze = joblib.load("joblib_files/labelencoder_Cutie de viteze.joblib")
label_encoder_caroserie = joblib.load("joblib_files/labelencoder_Tip Caroserie.joblib")
label_encoder_transmisie = joblib.load("joblib_files/labelencoder_Transmisie.joblib")
label_encoder_masina = joblib.load("joblib_files/labelencoder_y.joblib")

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()

    responses = np.array(data['responses'])

    transformed_responses = []
    for i, col in enumerate(responses):
        if i == 0:
            transformed_responses.append(label_encoder_culoare.transform([col])[0])
        elif i == 3:
            transformed_responses.append(label_encoder_combustibil.transform([col])[0])
        elif i == 4:
            transformed_responses.append(label_encoder_cutie_viteze.transform([col])[0])
        elif i == 5:
            transformed_responses.append(label_encoder_caroserie.transform([col])[0])
        elif i == 8:
            transformed_responses.append(label_encoder_transmisie.transform([col])[0])
        else:
            transformed_responses.append(col)

    transformed_responses = np.array(transformed_responses).reshape(1, -1)

    predictions = model.predict_proba(transformed_responses)
    predictions = np.argsort(predictions, axis=1)[:, -3:]
    predictions = np.sort(predictions)
    predictions = predictions.ravel()
    predictions = label_encoder_masina.inverse_transform(predictions).tolist()
    return jsonify(predictions)

if __name__=='__main__':
    app.run(debug=True)

