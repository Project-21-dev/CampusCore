from pathlib import Path
import os
import secrets

import joblib
import pandas as pd
from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, UploadFile

from app.models.student import StudentData
from app.face_service import enroll_student, enrollment_status, verify_student


app = FastAPI(
    title="CampusCore AI Service",
    version="1.0.0"
)


BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "student_risk_model.pkl"

AI_SERVICE_API_KEY = os.getenv("AI_SERVICE_API_KEY", "campuscore-local-ai-key-change-me")

def require_internal_api_key(x_internal_api_key: str | None = Header(default=None)):
    if not x_internal_api_key or not secrets.compare_digest(x_internal_api_key, AI_SERVICE_API_KEY):
        raise HTTPException(status_code=401, detail="Invalid internal API key")



try:
    model = joblib.load(MODEL_PATH)
except FileNotFoundError as error:
    raise RuntimeError(
        f"Trained model not found at: {MODEL_PATH}"
    ) from error


@app.get("/")
def root():
    return {
        "message": "CampusCore AI Service Running"
    }


@app.get("/health")
def health():
    face_engine_ready = True
    face_engine_error = None
    try:
        from app.face_service import _get_face_cascade
        _get_face_cascade()
    except Exception as error:
        face_engine_ready = False
        face_engine_error = str(error)

    return {
        "status": "UP",
        "modelLoaded": True,
        "faceEngineReady": face_engine_ready,
        "faceEngineError": face_engine_error
    }


@app.post("/predict")
def predict(data: StudentData, _: None = Depends(require_internal_api_key)):

    input_data = pd.DataFrame(
        [
            {
                "attendancePercentage":
                    data.attendancePercentage,

                "averageResultPercentage":
                    data.averageResultPercentage,

                "absenceCount":
                    data.absenceCount,

                "failedSubjects":
                    data.failedSubjects,

                "performanceTrend":
                    data.performanceTrend
            }
        ]
    )

    try:
        prediction = model.predict(input_data)[0]
        probabilities = model.predict_proba(input_data)[0]

        risk = str(prediction)
        confidence = float(max(probabilities))

    except Exception as error:
        raise HTTPException(
            status_code=500,
            detail=f"Prediction failed: {str(error)}"
        ) from error

    reasons = []
    recommendations = []

    if data.attendancePercentage < 75:
        reasons.append(
            "Attendance is below 75%."
        )
        recommendations.append(
            "Create an attendance improvement plan."
        )

    if data.averageResultPercentage < 50:
        reasons.append(
            "Average academic performance is below 50%."
        )
        recommendations.append(
            "Arrange remedial academic sessions."
        )

    if data.failedSubjects >= 2:
        reasons.append(
            f"The student has failed "
            f"{data.failedSubjects} subjects."
        )
        recommendations.append(
            "Provide subject-specific mentoring."
        )

    if data.absenceCount > 10:
        reasons.append(
            "The number of absences is high."
        )
        recommendations.append(
            "Contact the parent or guardian."
        )

    if data.performanceTrend < -10:
        reasons.append(
            "Recent academic performance is declining."
        )
        recommendations.append(
            "Review progress after the next assessment."
        )

    if not reasons:
        reasons.append(
            "Attendance and academic performance "
            "are currently stable."
        )

    if not recommendations:
        recommendations.append(
            "Continue regular monitoring and encouragement."
        )

    return {
        "risk": risk,
        "confidence": round(confidence, 3),
        "reasons": reasons,
        "recommendations": recommendations
    }

@app.post("/face/enroll")
async def face_enroll(
    student_id: int = Form(...),
    images: list[UploadFile] = File(...),
    _: None = Depends(require_internal_api_key),
):
    return await enroll_student(student_id, images)


@app.get("/face/enrollment/{student_id}")
def face_enrollment_status(student_id: int, _: None = Depends(require_internal_api_key)):
    return enrollment_status(student_id)


@app.post("/face/verify")
async def face_verify(
    student_id: int = Form(...),
    image: UploadFile = File(...),
    _: None = Depends(require_internal_api_key),
):
    return await verify_student(student_id, image)
