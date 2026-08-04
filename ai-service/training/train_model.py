import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score, classification_report


# Load the generated dataset
df = pd.read_csv("data/student_dataset.csv")


# Convert each student's values into:
# Low Risk, Medium Risk, or High Risk
def calculate_risk(row):
    score = 0

    if row["attendancePercentage"] < 75:
        score += 1

    if row["averageResultPercentage"] < 50:
        score += 1

    if row["failedSubjects"] >= 2:
        score += 1

    if row["absenceCount"] > 15:
        score += 1

    if row["performanceTrend"] < -10:
        score += 1

    if score >= 4:
        return "High Risk"

    elif score >= 2:
        return "Medium Risk"

    else:
        return "Low Risk"


# Create the target column
df["risk"] = df.apply(calculate_risk, axis=1)


# Input features used by the model
feature_columns = [
    "attendancePercentage",
    "averageResultPercentage",
    "absenceCount",
    "failedSubjects",
    "performanceTrend"
]

X = df[feature_columns]

# Output that the model must predict
y = df["risk"]


# Split the dataset:
# 80% for training and 20% for testing
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=0.2,
    random_state=42,
    stratify=y
)


# Create the Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    random_state=42,
    class_weight="balanced"
)


# Train the model
model.fit(X_train, y_train)


# Test the model
y_pred = model.predict(X_test)

accuracy = accuracy_score(y_test, y_pred)


# Save the trained model
joblib.dump(
    model,
    "models/student_risk_model.pkl"
)


# Display results
print("Model trained successfully!")
print("Model saved to models/student_risk_model.pkl")
print(f"Accuracy: {accuracy:.2%}")

print("\nRisk distribution:")
print(df["risk"].value_counts())

print("\nClassification report:")
print(
    classification_report(
        y_test,
        y_pred,
        zero_division=0
    )
)