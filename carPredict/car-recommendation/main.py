import numpy as np
from scipy.stats import randint
import matplotlib.pyplot as plt
import pandas as pd
import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix
from sklearn.model_selection import RandomizedSearchCV, learning_curve
from sklearn.tree import DecisionTreeClassifier
import seaborn as sns

pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", None)


def display_learning_curve():
    train_sizes, train_scores, test_scores = learning_curve(estimator=rfc,
                                                            X=X_train_df, y=y_train,
                                                            train_sizes=np.linspace(0.1, 1.0, 10),
                                                            scoring='accuracy',
                                                            n_jobs=1,
                                                            cv=5)

    train_mean = np.mean(train_scores, axis=1)
    train_std = np.std(train_scores, axis=1)
    test_mean = np.mean(test_scores, axis=1)
    test_std = np.std(test_scores, axis=1)

    plt.figure(figsize=(10, 6))
    plt.plot(train_sizes, train_mean, color='r', label="Training accuracy")
    plt.plot(train_sizes, test_mean, color='g', label="Testing accuracy")
    plt.fill_between(train_sizes, train_mean - train_std, train_mean + train_std, alpha=0.1, color='r')
    plt.fill_between(train_sizes, test_mean - test_std, test_mean + test_std, alpha=0.1, color='g')

    plt.title("Learning Curve")
    plt.xlabel("Training set size")
    plt.ylabel("Accuracy")
    plt.grid()
    plt.tight_layout()
    plt.legend()
    plt.savefig("processed_data/learning_curve.png")

def model_importances():
    importances = rfc.feature_importances_
    importances_df = pd.DataFrame({
        'Feature': X_train_df.columns,
        'Importance': importances
    })

    plt.figure(figsize=(10, 6))
    sns.barplot(x='Importance', y='Feature', data=importances_df)
    plt.title("Feature importances")
    plt.tight_layout()
    plt.savefig("processed_data/feature_importances.png")

X_train_df = pd.read_csv("processed_data/X_train.csv")
X_test_df = pd.read_csv("processed_data/X_test.csv")
y_train_df = pd.read_csv("processed_data/y_train.csv")
y_test_df = pd.read_csv("processed_data/y_test.csv")

X_train_df = X_train_df.drop(columns=['Cluster'])
X_test_df = X_test_df.drop(columns=['Cluster'])

y_train = y_train_df.values.ravel()
y_test = y_test_df.values.ravel()

rfc = RandomForestClassifier(random_state=42, n_jobs=-1, n_estimators=229, max_depth=19, min_samples_leaf=2,
                             min_samples_split=3)
rfc.fit(X_train_df, y_train)

# rfc = DecisionTreeClassifier(random_state=42, max_depth=18, min_samples_leaf=5, min_samples_split=4)
# rfc.fit(X_train_df, y_train)

joblib.dump(rfc, "joblib_files/model_ML.joblib")

y_predict = rfc.predict(X_test_df)
accuracy = accuracy_score(y_predict, y_test)
print("Test dataset accuracy - ", accuracy)

y_predict2 = rfc.predict(X_train_df)
accuracy_train = accuracy_score(y_predict2, y_train)
print("Train dataset accuracy - ", accuracy_train)

# model_importances()

# display_learning_curve()

# print("Classification report: \n" + classification_report(y_test, y_predict))
# print("Confusion matrix:")
# print(confusion_matrix(y_test, y_predict))

# param_dist = {
#     "n_estimators": randint(10, 300),
#     "max_depth": randint(3, 20),
#     "min_samples_split": randint(2, 20),
#     "min_samples_leaf": randint(1, 20)
# }
#
# random_search = RandomizedSearchCV(rfc, param_dist, scoring='accuracy', verbose=1, random_state=42, n_iter=50)
# random_search.fit(X_train_df, y_train)
#
# print("Best params: ", random_search.best_params_)
# print("Best score: ", random_search.best_score_)
