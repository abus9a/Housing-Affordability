from pydantic import BaseModel
from typing import Optional


class District(BaseModel):
    id: str
    name: str
    city: str
    avg_rent_1br: int
    avg_rent_2br: int
    avg_salary: int
    affordability_ratio: float
    affordability_index: int
    risk_level: str
    population: int
    lat: float
    lng: float
    rent_change_pct: float
    trend: str


class CityStats(BaseModel):
    city: str
    city_name: str
    avg_rent: int
    avg_salary: int
    affordability_index: float
    total_districts: int
    safe_districts: int
    moderate_districts: int
    dangerous_districts: int


class MacroData(BaseModel):
    gdp_per_capita_usd: Optional[float]
    unemployment_pct: Optional[float]
    year: Optional[int]


class DistrictAnalysis(BaseModel):
    district_id: str
    district_name: str
    analysis: str
    key_insight: str


class QueryRequest(BaseModel):
    question: str
    city: Optional[str] = None
    salary: Optional[int] = None


class QueryResponse(BaseModel):
    answer: str


class PersonalAffordabilityRequest(BaseModel):
    salary: int
    city: str


class PersonalAffordabilityResponse(BaseModel):
    salary: int
    city: str
    affordable_districts: list[str]
    borderline_districts: list[str]
    expensive_districts: list[str]
    recommendation: str
