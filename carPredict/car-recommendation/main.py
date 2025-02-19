import os
import pandas as pd
# from imblearn.over_sampling import SMOTE
from sklearn.preprocessing import LabelEncoder, OneHotEncoder
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", None)
os.environ["LOKY_MAX_CPU_COUNT"] = "4" # for smote

cars = pd.read_csv("raw/cars_cleaned_dataset.csv")
cars = cars.drop_duplicates()

X = cars.drop(["Masina"], axis=1)
y = cars["Masina"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

X_categorical_columns = X.select_dtypes(include="object").columns
X_numerical_columns = X.select_dtypes(exclude="object").columns

le = LabelEncoder()

for column in X_categorical_columns:
    X_train[column] = le.fit_transform(X_train[column])
    X_test[column] = le.transform(X_test[column])

X_train_df = pd.DataFrame(X_train).reset_index(drop=True)
X_test_df = pd.DataFrame(X_test).reset_index(drop=True)

y_train = le.fit_transform(y_train)
y_train_df = pd.DataFrame(y_train, columns=["Masina"]).reset_index(drop=True)

y_test = le.transform(y_test)
y_test_df = pd.DataFrame(y_test, columns=["Masina"]).reset_index(drop=True)
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
#
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

clf = RandomForestClassifier(random_state=42)
clf.fit(X_train_df, y_train)

# RandomForestClassifier
y_predict = clf.predict(X_test_df)
accuracy = accuracy_score(y_test, y_predict)
print(f"Accuracy score for RandomForestClassifier: {accuracy}")

while True:
    predicted_car_id = int(input("Put a number to predict from 0 to 1780: "))
    if predicted_car_id >= 0 and predicted_car_id <=1780:
        break

y_predict = clf.predict(X_test_df.iloc[[predicted_car_id]])
real_car = y_test_df.iloc[[predicted_car_id]]
real_car = le.inverse_transform(real_car.values.ravel())
print(f"Real car: {real_car}")
y_predict = le.inverse_transform(y_predict)
print(f"Predicted car: {y_predict}")

probs = clf.predict_proba(X_test_df.iloc[[predicted_car_id]])[0]

ids = clf.classes_
cars = le.inverse_transform(ids)

probs_df = pd.DataFrame({
    "ID": ids,
    "Masina": cars,
    "Probabilitate": probs
})

probs_df = probs_df.sort_values(by="Probabilitate", ascending=False).reset_index(drop=True)
probs_df.to_csv("v1/probs.csv", index=False)

top_predicts = probs_df["Masina"][:3]

first_car = top_predicts[0]
second_car = top_predicts[1]
third_car = top_predicts[2]

print(f"Top 3 predicts: {first_car} - {second_car} - {third_car}")