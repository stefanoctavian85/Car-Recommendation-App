import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score
from sklearn.preprocessing import LabelEncoder

pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", None)

X_train_df = pd.read_csv("processed_data/X_train.csv", index_col=0)
X_test_df = pd.read_csv("processed_data/X_test.csv", index_col=0)
y_train_df = pd.read_csv("processed_data/y_train.csv")
y_test_df = pd.read_csv("processed_data/y_test.csv")

y_train = y_train_df.values.ravel()
y_test = y_test_df.values.ravel()

clf = RandomForestClassifier(random_state=42)
clf.fit(X_train_df, y_train)

joblib.dump(clf, "joblib_files/model_ML.joblib")