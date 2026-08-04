import random
import pandas as pd
from faker import Faker

fake = Faker()


def generate_student():
    return {
        "attendancePercentage": random.randint(40, 100),
        "averageResultPercentage": random.randint(35, 100),
        "absenceCount": random.randint(0, 30),
        "failedSubjects": random.randint(0, 5),
        "performanceTrend": random.randint(-20, 20)
    }

students = []

for i in range(1000):
    students.append(generate_student())

df = pd.DataFrame(students)

df.to_csv("data/student_dataset.csv", index=False)

print("Dataset generated successfully!")
print(df.head())