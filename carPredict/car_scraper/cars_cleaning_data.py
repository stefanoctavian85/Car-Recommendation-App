import pandas as pd

def na_values(df: pd.DataFrame, col_name):
    for index, car in df.iterrows():
        if (pd.isnull(car[col_name])):
            similar_cars = df[
                (df["Marca"] == car["Marca"]) &
                (df["Model"] == car["Model"]) &
                (~df[col_name].isna())
            ]

            if not similar_cars.empty:
                df.at[index, col_name] = round(similar_cars[col_name].mean(), 0)

def consumption_na_values(df: pd.DataFrame, col_name):
    for index, car in df.iterrows():
        if (pd.isnull(car[col_name])):
            similar_cars = df[
                (df["Marca"] == car["Marca"]) &
                (df["Model"] == car["Model"]) &
                (df["Anul productiei"] == car["Anul productiei"]) &
                (df["Numar locuri"] == car["Numar locuri"]) &
                (df["Cutie de viteze"] == car["Cutie de viteze"]) &
                (df["Tip Caroserie"] == car["Tip Caroserie"]) &
                (df["Capacitate cilindrica"] == car["Capacitate cilindrica"]) &
                (df["Putere"] == car["Putere"]) &
                (df["Transmisie"] == car["Transmisie"]) &
                (~df[col_name].isna())
            ]

            if not similar_cars.empty:
                df.at[index, col_name] = round(similar_cars[col_name].mean(), 1)

cars = pd.read_csv("raw/cars_full_dataset.csv")

# NA values: Numar locuri(1,938), Capacitate cilindrica(235), Putere(3), Transmisie(647)
# Consum Urban(3,227), Consum Extraurban(4,296), Imagine(4)

# Removing l/100km from consum urban and consum extraurban
cars['Consum Urban'] = cars['Consum Urban'].str.extract(r'(\d+\.?\d*)')
cars['Consum Urban'] = pd.to_numeric(cars['Consum Urban'])
cars['Consum Extraurban'] = cars['Consum Extraurban'].str.extract(r'(\d+\.?\d*)')
cars['Consum Extraurban'] = pd.to_numeric(cars['Consum Extraurban'])

# Transforming price from XEUR into X
cars["Pret"] = cars["Pret"].str.extract(r'(\d+\s?\d*)')
cars["Pret"] = cars["Pret"].str.replace(" ", "")

cars["Capacitate cilindrica"] = cars["Capacitate cilindrica"].str.extract(r'(\d+\s?\d*)')
cars["Capacitate cilindrica"] = cars["Capacitate cilindrica"].str.replace(" ", "")
cars["Capacitate cilindrica"] = pd.to_numeric(cars["Capacitate cilindrica"])

cars["Putere"] = cars["Putere"].str.extract(r'(\d*)')
cars["Putere"] = pd.to_numeric(cars["Putere"])

na_values(cars, "Numar locuri")

coloana1 = "Consum Urban"
coloana2 = "Consum Extraurban"
consumption_na_values(cars, coloana1)
consumption_na_values(cars, coloana2)

cars = cars.dropna()

# Removing image column
cars = cars.drop(["Imagine"], axis=1)

cars["Marca"] = cars["Marca"] + " " + cars["Model"]
cars = cars.drop(["Model"], axis=1)
cars = cars.rename(columns={"Marca": "Masina"})

#Modify the subgroups into one group for colors, fuel type, body type and transmission
colors_df = cars["Culoare"].value_counts().reset_index()
another_culors = colors_df[colors_df["count"] < 100]["Culoare"].tolist()
cars["Culoare"] = cars["Culoare"].apply(lambda x: "Alte culori" if x in another_culors else x)

cars["Combustibil"] = cars["Combustibil"].apply(lambda x: "Benzina" if "Benzina" in x else
                                                            "Hibrid" if "Hibrid" in x else
                                                            "Diesel")

cars["Tip Caroserie"] = cars["Tip Caroserie"].apply(lambda x: "Sedan" if x in ["Sedan", "Combi"] else
                                                                "Compact" if x in ["Compacta", "Masina de oras", "Masina mica"] else
                                                                "Sport" if x in ["Cabrio", "Coupe"] else x)

cars["Transmisie"] = cars["Transmisie"].apply(lambda x: "4x4" if x in ["4x4 (automat)", "4x4 (manual)"] else x)

nr_cars_df = cars["Masina"].value_counts().reset_index()
nr_cars_df = nr_cars_df[nr_cars_df["count"] > 4]
cars = cars[cars["Masina"].isin(nr_cars_df["Masina"])]

cars.to_csv("raw/cars_cleaned_dataset.csv", index=False)