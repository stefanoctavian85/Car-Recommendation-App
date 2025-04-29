from scipy.stats import randint
import matplotlib.pyplot as plt
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.model_selection import RandomizedSearchCV

pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", None)

X_train_df = pd.read_csv("processed_data/X_train.csv", index_col=0)
X_test_df = pd.read_csv("processed_data/X_test.csv", index_col=0)
y_train_df = pd.read_csv("processed_data/y_train.csv")
y_test_df = pd.read_csv("processed_data/y_test.csv")

label_encoder_car = joblib.load("joblib_files/labelencoder_y.joblib")

y_train = y_train_df.values.ravel()
y_test = y_test_df.values.ravel()

clf = RandomForestClassifier(random_state=42, n_jobs=-1, n_estimators=229, max_depth=19, min_samples_leaf=2, min_samples_split=3)
clf.fit(X_train_df, y_train)

joblib.dump(clf, "joblib_files/model_ML.joblib")

y_predict = clf.predict(X_test_df)
accuracy = accuracy_score(y_predict, y_test)
print("Test dataset accuracy - ", accuracy)

y_predict2 = clf.predict(X_train_df)
accuracy_train = accuracy_score(y_predict2, y_train)
print("Train dataset accuracy - ", accuracy_train)

# param_dist = {
#     "n_estimators": randint(10, 300),
#     "max_depth": randint(3, 20),
#     "min_samples_split": randint(2, 20),
#     "min_samples_leaf": randint(1, 20)
# }
#
# random_search = RandomizedSearchCV(clf, param_dist, scoring='accuracy', verbose=1, random_state=42, n_iter=50)
# random_search.fit(X_train_df, y_train)
#
# print("Best params: ", random_search.best_params_)
# print("Best score: ", random_search.best_score_)

