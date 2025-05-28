import joblib
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from pandas.core.dtypes.common import is_numeric_dtype
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder, StandardScaler, OneHotEncoder
from kmodes.kprototypes import KPrototypes
import seaborn as sns


def find_optimal_nr_of_clusters(df: pd.DataFrame):
    inertia = []
    silhouette_scores = []

    for i in range(2, len(df.columns)):
        kmeans = KMeans(random_state=42, n_clusters=i)
        cluster_predictions = kmeans.fit_predict(df)

        inertia.append(kmeans.inertia_)
        score = silhouette_score(df, cluster_predictions)
        silhouette_scores.append(score)

        print(f"Nr. of clusters: {i}, inertia: {kmeans.inertia_}, silhouette_score: {score}")


def find_optimal_clusters_with_categ(df: pd.DataFrame, categorical_columns_index):
    costs = []
    clusters_range = list(range(2, len(df.columns)))

    for i in clusters_range:
        kprototypes = KPrototypes(random_state=42, n_clusters=i, n_jobs=-1)
        kprototypes.fit_predict(df, categorical=categorical_columns_index)

        costs.append(kprototypes.cost_)

        print(f"Nr. of clusters: {i}, cost: {kprototypes.cost_}")

    plt.figure(figsize=(10, 6))
    plt.plot(clusters_range, costs, marker='o')
    plt.xlabel("Nr. of clusters")
    plt.ylabel("Cost")
    plt.title("Cost method")
    plt.savefig("processed_data/clusters_elbow.png")


def clustering(X_train_df, X_test_df):
    kprototypes = KPrototypes(n_clusters=3, random_state=42, n_jobs=-1)

    training_clusters = kprototypes.fit_predict(X_train_df, categorical=categorical_columns_index)
    testing_clusters = kprototypes.predict(X_test_df, categorical=categorical_columns_index)

    joblib.dump(kprototypes, "joblib_files/kprototypes_clustering.joblib")
    return training_clusters, testing_clusters


def clusters_descriptions(df: pd.DataFrame, cluster_labels):
    df_clusters = df.copy()
    df_clusters["Cluster"] = cluster_labels

    descriptions = []
    for i in sorted(df_clusters['Cluster'].unique()):
        cluster = df_clusters[df_clusters['Cluster'] == i]
        row = {'Cluster': i, 'Samples': len(cluster)}
        for column in df_clusters.columns:
            if column != 'Cluster':
                if is_numeric_dtype(df_clusters[column]):
                    row[f"{column}"] = round(cluster[column].mean(), 2)
                else:
                    row[f"{column}"] = cluster[column].mode().iloc[0]
        descriptions.append(row)

    descriptions = pd.DataFrame(descriptions)
    return descriptions


def clusters_graphs(clusters):
    fig, axs = plt.subplots(nrows=2, ncols=3, figsize=(22, 10))
    axs = axs.flatten()

    for i, col in enumerate(numerical_columns):
        sns.barplot(x="Cluster", y=col, hue="Cluster", data=clusters, ax=axs[i], palette="Set1", legend=False)
        axs[i].set_title(col, fontsize=12)
        axs[i].set_xlabel("Cluster")
        axs[i].set_ylabel("Mean")

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.suptitle("Mean values for clusters", fontsize=16)
    plt.savefig("processed_data/mean_values_clusters.png")

    fig, axs = plt.subplots(nrows=2, ncols=2, figsize=(14, 8))
    axs = axs.flatten()

    for i, col in enumerate(categorical_columns):
        data = clusters.groupby(["Cluster", col]).size().unstack(fill_value=0)

        data.plot(kind='bar', ax=axs[i], color=['red', 'blue', 'green'])
        axs[i].set_title(col, fontsize=12)
        axs[i].set_xlabel("Cluster")
        axs[i].set_ylabel("Percentage")

    plt.tight_layout(rect=[0, 0, 1, 0.95])
    plt.suptitle("Mode values for clusters", fontsize=16)
    plt.savefig("processed_data/mode_values_clusters.png")


cars = pd.read_csv("raw/cars_cleaned_dataset.csv")
cars = cars.groupby(by="Masina").filter(lambda x: len(x) > 10)

X = cars.drop(["Masina", "Culoare", "Imagine", "Versiune", 'Numar de portiere', 'Generatie', 'Norma de poluare',
               'Audio si tehnologie', 'Confort si echipamente optionale', 'Electronice si sisteme de asistenta',
               'Performanta', 'Siguranta', 'Optiuni culoare', 'Consum Mixt', 'Volan pe dreapta', "Numar locuri",
               "Emisii CO2", "KM", "Nr_total_dotari"], axis=1)
y = cars["Masina"]

categorical_columns = X.select_dtypes(include="object").columns
numerical_columns = X.select_dtypes(exclude="object").columns

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42, stratify=y)

scaler = StandardScaler()
X_train_clustering = X_train.copy()
X_test_clustering = X_test.copy()
X_train_clustering[numerical_columns] = scaler.fit_transform(X_train[numerical_columns])
X_test_clustering[numerical_columns] = scaler.transform(X_test[numerical_columns])

categorical_columns_index = [X_train_clustering.columns.get_loc(column) for column in categorical_columns]
# find_optimal_clusters_with_categ(X_train_clustering, categorical_columns_index)

training_clusters, testing_clusters = clustering(X_train_clustering, X_test_clustering)

cluster_descriptions = clusters_descriptions(X_train, training_clusters)
cluster_descriptions.to_csv("processed_data/clusters.csv", index=False)
clusters_graphs(cluster_descriptions)

ohe = OneHotEncoder(handle_unknown='ignore')
X_cat_train = pd.DataFrame(ohe.fit_transform(X_train[categorical_columns]).toarray(),
                           columns=ohe.get_feature_names_out(categorical_columns), index=X_train.index)
X_cat_test = pd.DataFrame(ohe.transform(X_test[categorical_columns]).toarray(),
                          columns=ohe.get_feature_names_out(categorical_columns), index=X_test.index)

#Test with LabelEncoder
# X_cat_train = pd.DataFrame()
# X_cat_test = pd.DataFrame()
# for column in categorical_columns:
#     le = LabelEncoder()
#     X_cat_train[column] = le.fit_transform(X_train[column])
#     X_cat_test[column] = le.transform(X_test[column])
#
#     joblib.dump(le, f"joblib_files/labelencoder_{column}.joblib")

X_num_train_scaled = pd.DataFrame(scaler.fit_transform(X_train[numerical_columns]),
                                  columns=numerical_columns, index=X_train.index)
X_num_test_scaled = pd.DataFrame(scaler.transform(X_test[numerical_columns]),
                                 columns=numerical_columns, index=X_test.index)

X_train_df = pd.concat([X_num_train_scaled, X_cat_train,
                        pd.Series(training_clusters, name='Cluster', index=X_train.index)], axis=1)
X_test_df = pd.concat([X_num_test_scaled, X_cat_test,
                       pd.Series(testing_clusters, name='Cluster', index=X_test.index)], axis=1)

le_y = LabelEncoder()
y_train = le_y.fit_transform(y_train)
y_test = le_y.transform(y_test)

y_train_df = pd.DataFrame(y_train, columns=["Masina"])
y_test_df = pd.DataFrame(y_test, columns=["Masina"])

cars['Cluster'] = np.nan
cars.loc[X_train.index, "Cluster"] = training_clusters
cars.loc[X_test.index, "Cluster"] = testing_clusters

joblib.dump(le_y, "joblib_files/labelencoder_y.joblib")
joblib.dump(scaler, "joblib_files/standardscaler.joblib")
joblib.dump(ohe, "joblib_files/onehotencoder.joblib")

X_train_df.to_csv("processed_data/X_train.csv", index=False)
X_test_df.to_csv("processed_data/X_test.csv", index=False)
y_train_df.to_csv("processed_data/y_train.csv", index=False)
y_test_df.to_csv("processed_data/y_test.csv", index=False)
cars.to_csv("processed_data/final_cars_dataset.csv", index=False)

samples = []

for column in categorical_columns:
    group = cars.groupby(by=column).apply(lambda x: x.sample(n=min(500, len(x)), random_state=42))
    samples.append(group)

app_dataset = pd.concat(samples).drop_duplicates().reset_index(drop=True)
app_dataset.to_csv("processed_data/app_dataset.csv", index=False)