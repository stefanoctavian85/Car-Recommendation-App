import joblib
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler

pd.set_option("display.max_rows", None)

cars = pd.read_csv("raw/cars_cleaned_dataset.csv")
cars = cars.groupby(by="Masina").filter(lambda x: len(x) > 10)

X = cars.drop(["Masina", "Culoare", "Imagine", "Versiune", 'Numar de portiere', 'Generatie', 'Norma de poluare',
               'Audio si tehnologie', 'Confort si echipamente optionale', 'Electronice si sisteme de asistenta',
               'Performanta', 'Siguranta', 'Optiuni culoare', 'Consum Mixt', 'Volan pe dreapta', "Numar locuri",
               "Emisii CO2", "KM"], axis=1)
y = cars["Masina"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

X_categorical_columns = X.select_dtypes(include="object").columns
X_numerical_columns = X.select_dtypes(exclude="object").columns

scaler = StandardScaler()

for column in X_categorical_columns:
    le = LabelEncoder()
    X_train[column] = le.fit_transform(X_train[column])
    X_test[column] = le.transform(X_test[column])

    joblib.dump(le, f"joblib_files/labelencoder_{column}.joblib")

X_train[X_numerical_columns] = scaler.fit_transform(X_train[X_numerical_columns])
X_test[X_numerical_columns] = scaler.transform(X_test[X_numerical_columns])

joblib.dump(scaler, f"joblib_files/standardscaler.joblib")

X_train_df = pd.DataFrame(X_train).reset_index(drop=True)
X_test_df = pd.DataFrame(X_test).reset_index(drop=True)
X_train_df.index.name = "Observatia"
X_test_df.index.name = "Observatia"

le_y = LabelEncoder()

y_train = le_y.fit_transform(y_train)
y_train_df = pd.DataFrame(y_train, columns=["Masina"]).reset_index(drop=True)
y_train_df.index.name = "Observatia"

y_test = le_y.transform(y_test)
y_test_df = pd.DataFrame(y_test, columns=["Masina"]).reset_index(drop=True)
y_test_df.index.name = "Observatia"

joblib.dump(le_y, "joblib_files/labelencoder_y.joblib")

X_train_df.to_csv("processed_data/X_train.csv")
X_test_df.to_csv("processed_data/X_test.csv")
y_train_df.to_csv("processed_data/y_train.csv", index=False)
y_test_df.to_csv("processed_data/y_test.csv", index=False)