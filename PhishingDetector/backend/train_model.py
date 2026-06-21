import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

df = pd.read_csv("dataset.csv")

X = df[["len", "dots", "hyp", "is_ip", "has_tok", "https"]]
y = df["label"]

m = RandomForestClassifier()
m.fit(X.values, y)

joblib.dump(m, "model.pkl")
print("Success")