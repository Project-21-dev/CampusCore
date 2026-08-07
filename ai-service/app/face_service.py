from __future__ import annotations

import os
from pathlib import Path
from typing import Iterable

import cv2
import numpy as np
from fastapi import HTTPException, UploadFile

BASE_DIR = Path(__file__).resolve().parent.parent
FACE_DATA_DIR = BASE_DIR / "data" / "faces"
FACE_DATA_DIR.mkdir(parents=True, exist_ok=True)

FACE_SIZE = (200, 200)
MATCH_THRESHOLD = float(os.getenv("FACE_MATCH_THRESHOLD", "0.90"))

_cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
_face_cascade = cv2.CascadeClassifier(_cascade_path)


def _decode_image(raw: bytes) -> np.ndarray:
    array = np.frombuffer(raw, dtype=np.uint8)
    image = cv2.imdecode(array, cv2.IMREAD_COLOR)
    if image is None:
        raise HTTPException(status_code=400, detail="Could not decode image.")
    return image


def _extract_single_face(image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = _face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(80, 80),
    )

    if len(faces) == 0:
        raise HTTPException(status_code=400, detail="No face detected. Try again in better lighting.")
    if len(faces) > 1:
        raise HTTPException(status_code=400, detail="Multiple faces detected. Only one student should be visible.")

    # Use the largest detected face if the detector returns nested boxes.
    x, y, w, h = max(faces, key=lambda item: item[2] * item[3])
    face = gray[y : y + h, x : x + w]
    face = cv2.resize(face, FACE_SIZE)
    face = cv2.equalizeHist(face)
    return face


def _lbp_histogram(face: np.ndarray, grid: int = 8) -> np.ndarray:
    center = face[1:-1, 1:-1]
    neighbors = [
        face[:-2, :-2],
        face[:-2, 1:-1],
        face[:-2, 2:],
        face[1:-1, 2:],
        face[2:, 2:],
        face[2:, 1:-1],
        face[2:, :-2],
        face[1:-1, :-2],
    ]

    lbp = np.zeros_like(center, dtype=np.uint8)
    for bit, neighbor in enumerate(neighbors):
        lbp |= ((neighbor >= center).astype(np.uint8) << bit)

    h, w = lbp.shape
    features = []
    for row in range(grid):
        for col in range(grid):
            y0 = row * h // grid
            y1 = (row + 1) * h // grid
            x0 = col * w // grid
            x1 = (col + 1) * w // grid
            cell = lbp[y0:y1, x0:x1]
            hist = np.bincount(cell.ravel(), minlength=256).astype(np.float32)
            hist /= hist.sum() + 1e-8
            features.append(hist)

    feature = np.concatenate(features)
    feature /= np.linalg.norm(feature) + 1e-8
    return feature


def _dct_feature(face: np.ndarray) -> np.ndarray:
    small = cv2.resize(face, (64, 64)).astype(np.float32) / 255.0
    coeff = cv2.dct(small)[:12, :12].flatten()[1:]  # remove the DC coefficient
    coeff -= coeff.mean()
    coeff /= np.linalg.norm(coeff) + 1e-8
    return coeff.astype(np.float32)


def _face_template(face: np.ndarray) -> np.ndarray:
    # LBP captures local facial texture; low-frequency DCT captures overall face structure.
    lbp = _lbp_histogram(face)
    dct = _dct_feature(face)
    feature = np.concatenate([lbp * 0.8, dct * 0.2]).astype(np.float32)
    feature /= np.linalg.norm(feature) + 1e-8
    return feature


def _student_dir(student_id: int) -> Path:
    return FACE_DATA_DIR / str(student_id)


async def enroll_student(student_id: int, images: Iterable[UploadFile]) -> dict:
    images = list(images)
    if len(images) < 3:
        raise HTTPException(status_code=400, detail="Capture at least 3 face samples.")

    folder = _student_dir(student_id)
    folder.mkdir(parents=True, exist_ok=True)

    # Replace old biometric templates. Raw webcam photos are not persisted.
    for old in folder.glob("*.npy"):
        old.unlink(missing_ok=True)

    saved = 0
    for index, upload in enumerate(images[:5], start=1):
        raw = await upload.read()
        face = _extract_single_face(_decode_image(raw))
        template = _face_template(face)
        np.save(folder / f"template_{index}.npy", template)
        saved += 1

    return {
        "verified": True,
        "score": 1.0,
        "message": "Face enrollment completed.",
        "enrolledSamples": saved,
    }


def enrollment_status(student_id: int) -> dict:
    folder = _student_dir(student_id)
    count = len(list(folder.glob("*.npy"))) if folder.exists() else 0
    return {
        "studentId": student_id,
        "enrolled": count >= 3,
        "enrolledSamples": count,
    }


async def verify_student(student_id: int, image: UploadFile) -> dict:
    folder = _student_dir(student_id)
    template_files = sorted(folder.glob("*.npy")) if folder.exists() else []
    if len(template_files) < 3:
        raise HTTPException(status_code=400, detail="Face is not enrolled for this student.")

    enrolled_templates = []
    for template_path in template_files:
        try:
            enrolled_templates.append(np.load(template_path).astype(np.float32))
        except Exception as error:
            raise HTTPException(status_code=500, detail="Stored face enrollment is invalid.") from error

    probe_raw = await image.read()
    probe_face = _extract_single_face(_decode_image(probe_raw))
    probe_template = _face_template(probe_face)

    similarities = [float(np.dot(probe_template, enrolled)) for enrolled in enrolled_templates]
    # Use the median to avoid one unusually good or poor enrollment sample dominating the result.
    score = float(np.median(similarities))
    verified = score >= MATCH_THRESHOLD

    return {
        "verified": verified,
        "score": round(score, 3),
        "message": (
            "Face verified successfully."
            if verified
            else "Face did not match the enrolled template. Please try again in similar lighting."
        ),
        "enrolledSamples": len(enrolled_templates),
    }
