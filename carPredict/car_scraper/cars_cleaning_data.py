import numpy as np
import pandas as pd
from pandas.api.types import is_numeric_dtype
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import translators as ts
import ast

equipments_columns = ['Audio si tehnologie', 'Confort si echipamente optionale', 'Electronice si sisteme de asistenta', 'Performanta', 'Siguranta']

def extract_unique_equipment(df: pd.DataFrame, columns):
    equipments_dict = {}

    for column in columns:
        unique_values = set()
        for row in df[column]:
            if pd.isna(row):
                continue
            else:
                items = ast.literal_eval(row)
                for item in items:
                    unique_values.add(item)
        equipments_dict[column] = sorted(unique_values)

        max_len = max(len(values) for values in equipments_dict.values())
        for col, values in equipments_dict.items():
            equipments_dict[col] = values + [None] * (max_len - len(values))

    equipments_df = pd.DataFrame(equipments_dict)
    return equipments_df

def translate_equipments(df: pd.DataFrame):
    translated_equipments_dict = {}

    for column in df.columns:
        translated_values = []
        for value in df[column]:
            if pd.isna(value):
                translated_values.append(None)
            else:
                try:
                    translated_word = ts.translate_text(value, translator='google', from_language='ro', to_language='en')
                except:
                    translated_values.append(value)
                    continue

                translated_values.append(translated_word)
        translated_equipments_dict[f"{column}_en"] = translated_values

    translated_equipments = pd.DataFrame(translated_equipments_dict)
    return translated_equipments

def translate_equipments_for_df(df, translations_df, columns_to_translate):
    df_translated = df.copy()
    for column in columns_to_translate:
        translations_dict = dict(zip(translations_df[f"{column}"], translations_df[f"{column}_en"]))
        translated_column = []

        for row in df[column]:
            if pd.isna(row):
                translated_column.append(row)
            else:
                try:
                    items = ast.literal_eval(row)
                    translated_items = [translations_dict.get(item, item) for item in items]
                    translated_column.append(str(translated_items))
                except:
                    translated_column.append(row)

        df_translated[column] = translated_column

    return df_translated


def na_values(df: pd.DataFrame, col_name, group_by_cols=None):
    if group_by_cols is None:
        group_by_cols = ['Masina']

    missing_values_indices = df[df[col_name].isna()].index

    for index in missing_values_indices:
        car = df.loc[index]

        conditions = []

        for column in group_by_cols:
            conditions.append(f"(df['{column}'] == car['{column}'])")

        conditions.append(f"(~df['{col_name}'].isna())")
        query = " & ".join(conditions)

        similar_cars = df[eval(query)]

        if len(similar_cars) > 0:
            if is_numeric_dtype(df[col_name]):
                if col_name == "Numar locuri" or col_name == "Numar de portiere":
                    df.at[index, col_name] = int(similar_cars[col_name].median())
                else:
                    df.at[index, col_name] = round(similar_cars[col_name].median(), 1)
            else:
                df.at[index, col_name] = similar_cars[col_name].mode()[0]

def missing_values(cars: pd.DataFrame):
    cars["Marca"] = cars["Marca"] + " " + cars["Model"]
    cars = cars.drop(["Model"], axis=1)
    cars = cars.rename(columns={"Marca": "Masina"})

    cars = cars.rename(columns={'Anul producției': 'Anul productiei'})

    cars['Consum Urban'] = cars['Consum Urban'].str.extract(r'(\d+\.?\d*)')
    cars['Consum Urban'] = pd.to_numeric(cars['Consum Urban'])
    cars['Consum Extraurban'] = cars['Consum Extraurban'].str.extract(r'(\d+\.?\d*)')
    cars['Consum Extraurban'] = pd.to_numeric(cars['Consum Extraurban'])

    cars["Moneda"] = cars["Pret"].str.extract(r'(EUR|RON)')
    cars["Pret"] = cars["Pret"].str.extract(r'(\d+\s?\d*)')
    cars["Pret"] = cars["Pret"].str.replace(" ", "")
    cars["Pret"] = cars.apply(lambda row: float(row["Pret"]) / 5.00 if row["Moneda"] == "RON" else row["Pret"], axis=1)
    cars = cars.drop(["Moneda"], axis=1)

    cars["Capacitate cilindrica"] = cars["Capacitate cilindrica"].str.extract(r'(\d+\s?\d*)')
    cars["Capacitate cilindrica"] = cars["Capacitate cilindrica"].str.replace(" ", "")
    cars["Capacitate cilindrica"] = pd.to_numeric(cars["Capacitate cilindrica"])

    cars["Putere"] = cars["Putere"].str.extract(r'(\d*)')
    cars["Putere"] = pd.to_numeric(cars["Putere"])

    cars["KM"] = cars["KM"].str.extract(r'([\d\s]+)')[0].str.replace(" ", "", regex=True)
    cars["KM"] = pd.to_numeric(cars["KM"])

    cars["Emisii CO2"] = cars["Emisii CO2"].str.extract(r'(\d*)')
    cars["Emisii CO2"] = pd.to_numeric(cars["Emisii CO2"])

    cars['Volan pe dreapta'] = cars['Volan pe dreapta'].apply(lambda x: "Da" if x == "Da" else "Nu")

    cars["Combustibil"] = cars["Combustibil"].apply(
        lambda x: "Gasoline" if x in ["Benzina", "Benzina + GPL", "Benzina + CNG"] else
        "Hibrid" if x in ["Hibrid", "Hibrid Plug-In"]
        else x)

    cars["Cutie de viteze"] = cars["Cutie de viteze"].apply(lambda x: "Manual" if x == "Manuala"
                                                            else "Automatic")

    cars["Tip Caroserie"] = cars["Tip Caroserie"].apply(lambda x: "Sedan" if x in ["Sedan", "Combi"] else
    "Compact" if x in ["Compacta", "Masina mica", "Masina de oras"] else
    "Sport" if x in ["Cabrio", "Coupe"] else
    "Minivan" if x == "Monovolum" else x)


    cars["Transmisie"] = cars["Transmisie"].apply(lambda x: "AWD" if x in ["4x4 (automat)", "4x4 (manual)"]
                                                  else "FWD" if x == "Fata"
                                                  else "RWD" if x == "Spate"
                                                  else x)

    cars["Volan pe dreapta"] = cars["Volan pe dreapta"].apply(lambda x: "Yes" if x == "Da"
                                                              else "No")

    cars["Optiuni culoare"] = cars["Optiuni culoare"].apply(lambda x: "Metallic" if x == "Metalizata"
                                                            else "Matte" if x == "Mat"
                                                            else "Pearl" if x == "Perlat"
                                                            else x)

    cars["Norma de poluare"] = cars["Norma de poluare"].apply(lambda x: "Euro 5" if x in ["Euro 5", "Euro 5b"] else
    "Euro 6" if x in ["Euro 6", "Euro 6b", "Euro 6c", "Euro 6d", "Euro 6d-Temp"]
    else x)

    cars["Norma de poluare"] = np.where((cars["Combustibil"] == "Electric") & (cars["Norma de poluare"].isna()),
                                        "Euro 6", cars["Norma de poluare"])

    cars["Norma de poluare"] = cars.apply(
        lambda x: "Euro 6" if (x["Anul productiei"] >= 2015) & (x["Anul productiei"] <= 2025) else
        "Euro 5" if (x["Anul productiei"] >= 2009) & (x["Anul productiei"] <= 2014) else
        "Euro 4" if (x["Anul productiei"] >= 2005) & (x["Anul productiei"] <= 2008) else
        "Euro 3" if (x["Anul productiei"] >= 2000) & (x["Anul productiei"] <= 2004) else
        "Euro 2" if (x["Anul productiei"] >= 1996) & (x["Anul productiei"] <= 2000) else
        "Euro 1" if (x["Anul productiei"] >= 1992) & (x["Anul productiei"] <= 1995) else
        "Non-euro", axis=1)

    cars["Culoare"] = cars["Culoare"].apply(lambda x: "White" if x == "Alb"
                                 else "Blue" if x == "Albastru"
                                 else "Silver" if x == "Argint"
                                 else "Beige" if x == "Bej"
                                 else "Yellow" if x == "Galben/Auriu"
                                 else "Grey" if x == "Gri"
                                 else "Brown" if x == "Maro"
                                 else "Black" if x == "Negru"
                                 else "Orange" if x == "Portocaliu"
                                 else "Red" if x == "Rosu"
                                 else "Green" if x == "Green"
                                 else "Others")

    group = ['Masina', 'Anul productiei', 'Combustibil']

    na_values(cars, "Numar locuri")
    na_values(cars, "Numar de portiere")
    na_values(cars, "Consum Urban")
    na_values(cars, "Consum Extraurban")
    na_values(cars, "Capacitate cilindrica", group)
    na_values(cars, "Putere", group)
    na_values(cars, "Cutie de viteze")
    na_values(cars, "Transmisie")
    na_values(cars, "Norma de poluare", group)
    na_values(cars, "Emisii CO2", group)

    cars['Consum Mixt'] = (cars['Consum Urban'] + cars['Consum Extraurban']) / 2
    cars['Consum Mixt'] = round(cars['Consum Mixt'], 1)

    cars['Capacitate cilindrica'] = cars['Capacitate cilindrica'].apply(lambda x: 0 if pd.isna(x) else x)

    cars.loc[(cars["Combustibil"] == "Electric") | (cars["Combustibil"] == "Hibrid"), "Emisii CO2"] = 0

    cars = cars.dropna(subset=['Putere', 'Transmisie', 'KM', 'Numar locuri', 'Consum Urban', 'Consum Extraurban', 'Consum Mixt', 'Emisii CO2'])

    return cars


def calculate_number_of_facilities(row):
    facilities_columns = ["Audio si tehnologie", "Confort si echipamente optionale",
                          "Electronice si sisteme de asistenta", "Performanta", "Siguranta"]
    total_number = 0

    for column in facilities_columns:
        value = row[column]
        if pd.isna(value) or value.strip() == '':
            continue

        facilities = [x.strip() for x in value.split(', ')]
        total_number += len(facilities)

    return total_number

def eliminate_outliers(cars: pd.DataFrame):
    numerical_columns = cars.select_dtypes(exclude="object").columns

    X = cars[numerical_columns]

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    iso = IsolationForest(random_state=42)
    iso.fit(X_scaled)

    predictions = iso.predict(X_scaled)
    cars["is_outlier"] = predictions
    cars = cars[cars["is_outlier"] == 1]
    cars = cars.drop(columns=["is_outlier"])
    return cars

cars = pd.read_csv("raw/cars_dataset.csv")
cars = missing_values(cars)
cars["Nr_total_dotari"] = cars.apply(calculate_number_of_facilities, axis=1)
cars = eliminate_outliers(cars)

unique_equipments = extract_unique_equipment(cars, equipments_columns)
translated_unique_equipments = translate_equipments(unique_equipments)
final_translated_equipments = pd.concat([unique_equipments, translated_unique_equipments], axis=1)

final_cars_df = translate_equipments_for_df(cars, final_translated_equipments, equipments_columns)
final_cars_df.to_csv("raw/cars_cleaned_dataset.csv", index=False)