import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

interactions = pd.read_csv("raw/cleaned_user_interactions.csv", index_col=0)
phrases = interactions["text"]
y = interactions["category"]

vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(phrases)

joblib.dump(vectorizer, "joblib_files/tfidf_vectorizer.joblib")

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

clf = RandomForestClassifier(random_state=42)
clf.fit(X_train, y_train)

joblib.dump(clf, "joblib_files/model_ML.joblib")