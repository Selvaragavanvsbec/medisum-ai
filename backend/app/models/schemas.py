"""API request/response schemas."""
from typing import List, Literal

from pydantic import BaseModel, Field


class SummarizeRequest(BaseModel):
    report_text: str = Field(..., description="Raw medical report text.")
    reading_level: Literal["simple", "teen", "detailed"] = "simple"


class Finding(BaseModel):
    item: str
    value: str
    meaning: str
    flag: str


class Term(BaseModel):
    term: str
    definition: str


class HealthScoreCategories(BaseModel):
    heart: int = 100
    diabetes: int = 100
    kidney: int = 100
    liver: int = 100
    blood: int = 100


class HealthScore(BaseModel):
    overall: int = 100
    categories: HealthScoreCategories = Field(default_factory=HealthScoreCategories)


class AlertItem(BaseModel):
    item: str
    value: str
    severity: Literal["green", "yellow", "red"]
    risk_percentage: int
    reason: str
    suggested_action: str


class ReminderItem(BaseModel):
    text: str
    days_suggested: int
    reason: str


class PatientDetails(BaseModel):
    age: str = "not stated"
    gender: str = "not stated"
    test_date: str = "not stated"
    report_type: str = "not stated"


class SummaryResponse(BaseModel):
    overview: str
    key_findings: List[Finding] = []
    abnormal_highlights: List[str] = []
    terms_explained: List[Term] = []
    questions_for_doctor: List[str] = []
    disclaimer: str
    health_score: HealthScore | None = None
    alerts: List[AlertItem] = []
    reminders: List[ReminderItem] = []
    patient_details: PatientDetails | None = None
    medicines: List[str] = []
    lifestyle_suggestions: List[str] = []
    risk_level: str = "low"
    emergency_warning: str | None = None
