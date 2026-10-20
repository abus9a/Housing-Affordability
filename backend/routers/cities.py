from fastapi import APIRouter, HTTPException
from models import District, CityStats
from services.housing_service import get_districts

router = APIRouter(prefix="/api/cities", tags=["cities"])

CITY_NAMES = {"almaty": "Almaty", "astana": "Astana"}
VALID_CITIES = set(CITY_NAMES.keys())


@router.get("", response_model=list[dict])
async def list_cities():
    return [
        {"id": "almaty", "name": "Almaty", "center": [43.2220, 76.8512], "zoom": 12},
        {"id": "astana", "name": "Astana", "center": [51.1694, 71.4491], "zoom": 12},
    ]


@router.get("/{city}/districts", response_model=list[District])
async def get_city_districts(city: str):
    if city not in VALID_CITIES:
        raise HTTPException(status_code=404, detail="City not found")
    return get_districts(city)


@router.get("/{city}/stats", response_model=CityStats)
async def get_city_stats(city: str):
    if city not in VALID_CITIES:
        raise HTTPException(status_code=404, detail="City not found")

    districts = get_districts(city)
    safe = sum(1 for d in districts if d.risk_level == "safe")
    moderate = sum(1 for d in districts if d.risk_level == "moderate")
    dangerous = sum(1 for d in districts if d.risk_level == "dangerous")

    avg_rent = int(sum(d.avg_rent_1br for d in districts) / len(districts))
    avg_salary = int(sum(d.avg_salary for d in districts) / len(districts))
    avg_index = round(sum(d.affordability_index for d in districts) / len(districts), 1)

    return CityStats(
        city=city,
        city_name=CITY_NAMES[city],
        avg_rent=avg_rent,
        avg_salary=avg_salary,
        affordability_index=avg_index,
        total_districts=len(districts),
        safe_districts=safe,
        moderate_districts=moderate,
        dangerous_districts=dangerous,
    )
