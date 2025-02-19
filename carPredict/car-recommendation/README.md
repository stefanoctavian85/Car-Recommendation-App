# Car Prediction using Random Forest Classifier

## Description
This project uses a Random Forest Classifier to predict the type of a car based on a dataset containing car features. The model is trained on the cleaned dataset and can predict the car type when provided with certain input features. The project demonstrates data preprocessing techniques such as label encoding, model training, and prediction, along with evaluating the model's accuracy.

## Features
- **Data Preprocessing**: The dataset is preprocessed by removing duplicates and encoding categorical variables using LabelEncoder.
- **Model Training**: A Random Forest Classifier is used to train the model on the preprocessed data.
- **Prediction**: After training, the model can predict the type of car based on input features.
- **Top 3 Predictions**: The model also returns the top 3 most likely predictions along with their probabilities.
- **CSV Outputs**: The preprocessed training and testing data, along with predicted probabilities, are saved as CSV files.

## System Requirements
- Python 3.x
- pandas
- scikit-learn

## Installation
To set up this project locally, follow these steps:

1. Clone the repository:
   git clone https://github.com/stefanoctavian85/car-recommendation.git
2. Navigate to the project directory:
   cd car-recommendation
3. Install dependencies:
   pip install pandas, sklearn OR conda install pandas, sklearn(in my case).
4. Run the script in python.
