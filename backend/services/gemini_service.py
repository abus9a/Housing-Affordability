import google.generativeai as genai
from config import settings
from models import District, MacroData

genai.configure(api_key=settings.gemini_api_key)
_model = genai.GenerativeModel("gemini-3-flash-preview")


async def analyze_district(district: District, macro: MacroData | None = None) -> tuple[str, str]:
    macro_ctx = ""
    if macro and macro.gdp_per_capita_usd:
        macro_ctx = f"\nKazakhstan GDP per capita: ${macro.gdp_per_capita_usd:,.0f} USD ({macro.year})"
        if macro.unemployment_pct:
            macro_ctx += f", unemployment: {macro.unemployment_pct}%"

    ratio_pct = district.affordability_ratio * 100
    prompt = f"""You are a housing affordability expert specializing in Kazakhstan's real estate market.

Analyze housing data for {district.name} district in {district.city.capitalize()}:
- Average monthly rent (1BR): {district.avg_rent_1br:,} KZT
- Average monthly rent (2BR): {district.avg_rent_2br:,} KZT
- Average monthly salary: {district.avg_salary:,} KZT
- Rent-to-income ratio: {ratio_pct:.1f}%
- Risk level: {district.risk_level.upper()}
- Annual rent change: +{district.rent_change_pct}%
- Trend: {district.trend}{macro_ctx}

Write exactly 2 paragraphs:
1. What this affordability situation means for residents and who can realistically live here.
2. Whether the trend is alarming and what income level someone needs to live comfortably (apply the 30% rule).

Then on a new line starting with "KEY:" write one short punchy insight (max 15 words, no period).

Be direct, use KZT figures, no vague language."""

    response = await _model.generate_content_async(prompt)
    text = response.text.strip()

    key_insight = ""
    analysis = text
    if "KEY:" in text:
        parts = text.split("KEY:", 1)
        analysis = parts[0].strip()
        key_insight = parts[1].strip()

    return analysis, key_insight


async def analyze_city(city: str, districts: list[District], macro: MacroData | None = None) -> str:
    district_lines = "\n".join(
        f"- {d.name}: rent {d.avg_rent_1br:,} KZT, salary {d.avg_salary:,} KZT, ratio {d.affordability_ratio*100:.1f}% ({d.risk_level})"
        for d in districts
    )
    macro_ctx = ""
    if macro and macro.gdp_per_capita_usd:
        macro_ctx = f"\nKazakhstan GDP per capita: ${macro.gdp_per_capita_usd:,.0f} USD"

    prompt = f"""You are a housing market analyst for Kazakhstan.

City: {city.capitalize()}
Districts:{macro_ctx}
{district_lines}

Provide a 3-sentence city-level housing market summary:
1. Overall affordability situation.
2. Which district is the most overheated and why it is problematic.
3. One actionable advice for residents looking for affordable housing.

Be specific with district names and KZT figures. No generic statements."""

    response = await _model.generate_content_async(prompt)
    return response.text.strip()


async def personal_affordability_analysis(
    salary: int,
    city: str,
    districts: list[District],
) -> str:
    district_lines = "\n".join(
        f"- {d.name}: rent {d.avg_rent_1br:,} KZT/mo ({d.affordability_ratio*100:.1f}% of city avg salary, would be {d.avg_rent_1br/salary*100:.1f}% of your salary)"
        for d in districts
    )
    prompt = f"""You are a housing advisor for Kazakhstan.

Person's monthly salary: {salary:,} KZT
City: {city.capitalize()}

Districts and what they would cost this person:
{district_lines}

The 30% rule: rent should not exceed 30% of income. For this person, that is {salary*0.3:,.0f} KZT/month.

Write 3 sentences:
1. Which districts are comfortably affordable for this person (under 30% threshold).
2. Which districts are a stretch and the risk they pose.
3. One concrete recommendation.

Use district names and exact KZT numbers. Be direct and practical."""

    response = await _model.generate_content_async(prompt)
    return response.text.strip()


async def answer_question(question: str, context: str) -> str:
    prompt = f"""You are a housing affordability expert for Kazakhstan, specializing in Almaty and Astana.

Context data:
{context}

User question: {question}

Answer concisely in 2-4 sentences. Use specific data from the context. If the question is not about housing in Kazakhstan, politely redirect."""

    response = await _model.generate_content_async(prompt)
    return response.text.strip()
