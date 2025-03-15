import numpy as np
import pandas as pd
from pandas.api.types import is_numeric_dtype

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


cars = pd.read_csv("raw/cars_dataset.csv")

cars["Marca"] = cars["Marca"] + " " + cars["Model"]
cars = cars.drop(["Model"], axis=1)
cars = cars.rename(columns={"Marca": "Masina"})

cars = cars.rename(columns={'Anul producției': 'Anul productiei'})

cars['Consum Urban'] = cars['Consum Urban'].str.extract(r'(\d+\.?\d*)')
cars['Consum Urban'] = pd.to_numeric(cars['Consum Urban'])
cars['Consum Extraurban'] = cars['Consum Extraurban'].str.extract(r'(\d+\.?\d*)')
cars['Consum Extraurban'] = pd.to_numeric(cars['Consum Extraurban'])

cars["Pret"] = cars["Pret"].str.extract(r'(\d+\s?\d*)')
cars["Pret"] = cars["Pret"].str.replace(" ", "")

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

cars["Combustibil"] = cars["Combustibil"].apply(lambda x: "Benzina" if x in ["Benzina", "Benzina + GPL", "Benzina + CNG"] else
                                                            "Hibrid" if x in ["Hibrid", "Hibrid Plug-In"]
                                                            else x)

cars["Tip Caroserie"] = cars["Tip Caroserie"].apply(lambda x: "Sedan" if x in ["Sedan", "Combi"] else
                                                                "Compact" if x in ["Compacta", "Masina mica", "Masina de oras"] else
                                                                "Sport" if x in ["Cabrio", "Coupe"] else x)

cars["Transmisie"] = cars["Transmisie"].apply(lambda x: "4x4" if x in ["4x4 (automat)", "4x4 (manual)"] else x)

cars["Norma de poluare"] = cars["Norma de poluare"].apply(lambda x: "Euro 5" if x in ["Euro 5", "Euro 5b"] else
                                                                    "Euro 6" if x in ["Euro 6", "Euro 6b", "Euro 6c", "Euro 6d", "Euro 6d-Temp"]
                                                                    else x)

cars["Norma de poluare"] = np.where((cars["Combustibil"] == "Electric") & (cars["Norma de poluare"].isna()), "Euro 6", cars["Norma de poluare"])

cars["Norma de poluare"] = cars.apply(lambda x: "Euro 6" if (x["Anul productiei"] >= 2015) & (x["Anul productiei"] <= 2025) else
                                                "Euro 5" if (x["Anul productiei"] >= 2009) & (x["Anul productiei"] <= 2014) else
                                                "Euro 4" if (x["Anul productiei"] >= 2005) & (x["Anul productiei"] <= 2008) else
                                                "Euro 3" if (x["Anul productiei"] >= 2000) & (x["Anul productiei"] <= 2004) else
                                                "Euro 2" if (x["Anul productiei"] >= 1996) & (x["Anul productiei"] <= 2000) else
                                                "Euro 1" if (x["Anul productiei"] >= 1992) & (x["Anul productiei"] <= 1995) else
                                                "Non-euro", axis=1)

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

cars['Capacitate cilindrica'] = cars['Capacitate cilindrica'].apply(lambda x: 0 if pd.isna(x)
                                                                    else x)

cars = cars.dropna(subset=['Putere', 'Transmisie', 'KM', 'Numar locuri', 'Consum Urban', 'Consum Extraurban', 'Consum Mixt'])

cars.to_csv("raw/cars_cleaned_dataset.csv", index=False)