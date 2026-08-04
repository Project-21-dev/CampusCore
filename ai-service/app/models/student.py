from pydantic import BaseModel, Field


class StudentData(BaseModel):
    attendancePercentage: float = Field(ge=0, le=100)
    averageResultPercentage: float = Field(ge=0, le=100)
    absenceCount: int = Field(ge=0)
    failedSubjects: int = Field(ge=0)
    performanceTrend: float = Field(ge=-100, le=100)