from fastapi import APIRouter, HTTPException
from models import (
    DistrictAnalysis,
    QueryRequest,
    QueryResponse,
    PersonalAffordabilityRequest,
    PersonalAffordabilityResponse,
)
from services.housing_service import get_district_by_id, get_districts
from services.world_bank_service import get_macro_data
from services import gemini_service

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.get("/district/{district_id}", response_model=DistrictAnalysis)
async def district_analysis(district_id: str):
    district = get_district_by_id(district_id)
    if not district:
        raise HTTPException(status_code=404, detail="District not found")

    macro = await get_macro_data()
    analysis, key_insight = await gemini_service.analyze_district(district, macro)

    return DistrictAnalysis(
        district_id=district.id,
        district_name=district.name,
        analysis=analysis,
        key_insight=key_insight,
    )


@router.get("/city/{city}")
async def city_analysis(city: str):
    districts = get_districts(city)
    if not districts:
        raise HTTPException(status_code=404, detail="City not found")

    macro = await get_macro_data()
    analysis = await gemini_service.analyze_city(city, districts, macro)
    return {"city": city, "analysis": analysis}


@router.post("/personal", response_model=PersonalAffordabilityResponse)
async def personal_affordability(req: PersonalAffordabilityRequest):
    districts = get_districts(req.city)
    if not districts:
        raise HTTPException(status_code=404, detail="City not found")

    threshold_safe = req.salary * 0.30
    threshold_moderate = req.salary * 0.50

    affordable = [d.name for d in districts if d.avg_rent_1br <= threshold_safe]
    borderline = [d.name for d in districts if threshold_safe < d.avg_rent_1br <= threshold_moderate]
    expensive = [d.name for d in districts if d.avg_rent_1br > threshold_moderate]

    recommendation = await gemini_service.personal_affordability_analysis(req.salary, req.city, districts)

    return PersonalAffordabilityResponse(
        salary=req.salary,
        city=req.city,
        affordable_districts=affordable,
        borderline_districts=borderline,
        expensive_districts=expensive,
        recommendation=recommendation,
    )


@router.post("/query", response_model=QueryResponse)
async def query(req: QueryRequest):
    city = req.city or "almaty"
    districts = get_districts(city)

    context_lines = [f"{d.name} ({city}): rent {d.avg_rent_1br:,} KZT, salary {d.avg_salary:,} KZT, ratio {d.affordability_ratio*100:.1f}%" for d in districts]
    if req.city is None:
        astana_districts = get_districts("astana")
        context_lines += [f"{d.name} (astana): rent {d.avg_rent_1br:,} KZT, salary {d.avg_salary:,} KZT, ratio {d.affordability_ratio*100:.1f}%" for d in astana_districts]

    context = "\n".join(context_lines)
    if req.salary:
        context += f"\n\nUser's monthly salary: {req.salary:,} KZT"

    answer = await gemini_service.answer_question(req.question, context)
    return QueryResponse(answer=answer)
