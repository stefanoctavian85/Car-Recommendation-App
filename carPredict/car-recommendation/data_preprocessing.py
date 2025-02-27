import os
import joblib
import pandas as pd
from imblearn.over_sampling import SMOTE
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
os.environ["LOKY_MAX_CPU_COUNT"] = "4" # for smote

cars = pd.read_csv("raw/cars_cleaned_dataset.csv")
cars = cars.drop_duplicates()

X = cars.drop(["Masina"], axis=1)
y = cars["Masina"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

X_categorical_columns = X.select_dtypes(include="object").columns
X_numerical_columns = X.select_dtypes(exclude="object").columns

#Varianta cu LabelEncoder
le = LabelEncoder()

for column in X_categorical_columns:
    X_train[column] = le.fit_transform(X_train[column])
    X_test[column] = le.transform(X_test[column])

    joblib.dump(le, f"joblib_files/labelencoder_{column}.joblib")


X_train_df = pd.DataFrame(X_train).reset_index(drop=True)
X_test_df = pd.DataFrame(X_test).reset_index(drop=True)
X_train_df.index.name = "Observatia"
X_test_df.index.name = "Observatia"

y_train = le.fit_transform(y_train)
y_train_df = pd.DataFrame(y_train, columns=["Masina"]).reset_index(drop=True)
y_train_df.index.name = "Observatia"

y_test = le.transform(y_test)
y_test_df = pd.DataFrame(y_test, columns=["Masina"]).reset_index(drop=True)
y_test_df.index.name = "Observatia"

joblib.dump(le, "joblib_files/labelencoder_y.joblib")

X_train_df.to_csv("processed_data/X_train.csv")
X_test_df.to_csv("processed_data/X_test.csv")
y_train_df.to_csv("processed_data/y_train.csv", index=False)
y_test_df.to_csv("processed_data/y_test.csv", index=False)

#SMOTE
# min_samples = 6
# classes = y_train_df["Masina"].value_counts()
# valid_classes = classes[classes >= min_samples].index
#
# X_train_df = X_train_df[y_train_df["Masina"].isin(valid_classes)]
# y_train = y_train_df[y_train_df["Masina"].isin(valid_classes)]
#
# smote = SMOTE(sampling_strategy="auto")
# X_train_df, y_train = smote.fit_resample(X_train_df, y_train)

#
# X_train_df.to_csv("v1/X_train.csv", index=False)
# X_test_df.to_csv("v1/X_test.csv", index=False)
# y_train_df.to_csv("v1/y_train.csv", index=False)
# y_test_df.to_csv("v1/y_test.csv", index=False)

# #Varianta de test cu OneHotEncoder
# ohe = OneHotEncoder(sparse_output=False, handle_unknown="ignore")
#
# X_train_df = pd.DataFrame(X_train[X_numerical_columns], index=X_train.index)
# X_train = ohe.fit_transform(X_train[X_categorical_columns])
# X_train = pd.DataFrame(X_train, columns=ohe.get_feature_names_out(X_categorical_columns), index=X_train_df.index)
# X_train_df = pd.concat([X_train_df, X_train], axis=1).reset_index(drop=True)
#
# X_test_df = pd.DataFrame(X_test[X_numerical_columns], index=X_test.index)
# X_test = ohe.transform(X_test[X_categorical_columns])
# X_test = pd.DataFrame(X_test, columns=ohe.get_feature_names_out(X_categorical_columns), index=X_test_df.index)
# X_test_df = pd.concat([X_test_df, X_test], axis=1).reset_index(drop=True)
#
# le = LabelEncoder()
# y_train = pd.DataFrame(le.fit_transform(y_train), columns=["Masina"]).reset_index(drop=True)
# y_test = pd.DataFrame(le.transform(y_test), columns=["Masina"]).reset_index(drop=True)
