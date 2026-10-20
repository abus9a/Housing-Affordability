from models import District

# All monetary values in KZT/month.
# Rent figures based on 2024-2025 Almaty/Astana rental market data.
# Salary figures based on Bureau of National Statistics regional wage data:
#   - Kazakhstan national average: ~423,000 KZT (Q1 2025)
#   - Almaty city average: ~580,000 KZT (~37% above national avg)
#   - Astana city average: ~630,000 KZT (~49% above national avg)
# District salaries reflect local industry mix (finance/IT premium in central districts,
# industrial/logistics discount in peripheral ones).
DISTRICTS_DATA = [
    {
        "id": "almaty-medeu",
        "name": "Medeu",
        "city": "almaty",
        "avg_rent_1br": 380000,
        "avg_rent_2br": 620000,
        "avg_salary": 750000,
        "population": 165000,
        "lat": 43.2667,
        "lng": 76.9500,
        "rent_change_pct": 18.4,
        "trend": "worsening",
    },
    {
        "id": "almaty-bostandyk",
        "name": "Bostandyk",
        "city": "almaty",
        "avg_rent_1br": 270000,
        "avg_rent_2br": 435000,
        "avg_salary": 640000,
        "population": 210000,
        "lat": 43.2167,
        "lng": 76.8833,
        "rent_change_pct": 12.1,
        "trend": "worsening",
    },
    {
        "id": "almaty-alatau",
        "name": "Alatau",
        "city": "almaty",
        "avg_rent_1br": 195000,
        "avg_rent_2br": 315000,
        "avg_salary": 520000,
        "population": 280000,
        "lat": 43.1833,
        "lng": 76.8333,
        "rent_change_pct": 8.7,
        "trend": "stable",
    },
    {
        "id": "almaty-almaly",
        "name": "Almaly",
        "city": "almaty",
        "avg_rent_1br": 250000,
        "avg_rent_2br": 400000,
        "avg_salary": 590000,
        "population": 190000,
        "lat": 43.2500,
        "lng": 76.9167,
        "rent_change_pct": 14.3,
        "trend": "worsening",
    },
    {
        "id": "almaty-auezov",
        "name": "Auezov",
        "city": "almaty",
        "avg_rent_1br": 160000,
        "avg_rent_2br": 260000,
        "avg_salary": 480000,
        "population": 350000,
        "lat": 43.2333,
        "lng": 76.8500,
        "rent_change_pct": 6.2,
        "trend": "stable",
    },
    {
        "id": "almaty-turksib",
        "name": "Turksib",
        "city": "almaty",
        "avg_rent_1br": 125000,
        "avg_rent_2br": 205000,
        "avg_salary": 440000,
        "population": 290000,
        "lat": 43.3167,
        "lng": 76.9833,
        "rent_change_pct": 4.1,
        "trend": "improving",
    },
    {
        "id": "almaty-zhetysu",
        "name": "Zhetysu",
        "city": "almaty",
        "avg_rent_1br": 135000,
        "avg_rent_2br": 225000,
        "avg_salary": 455000,
        "population": 245000,
        "lat": 43.2833,
        "lng": 77.0167,
        "rent_change_pct": 5.3,
        "trend": "stable",
    },
    {
        "id": "almaty-nauryzbai",
        "name": "Nauryzbai",
        "city": "almaty",
        "avg_rent_1br": 170000,
        "avg_rent_2br": 275000,
        "avg_salary": 465000,
        "population": 180000,
        "lat": 43.1667,
        "lng": 76.7833,
        "rent_change_pct": 7.8,
        "trend": "stable",
    },
    {
        "id": "astana-esil",
        "name": "Esil",
        "city": "astana",
        "avg_rent_1br": 350000,
        "avg_rent_2br": 565000,
        "avg_salary": 790000,
        "population": 195000,
        "lat": 51.1694,
        "lng": 71.4491,
        "rent_change_pct": 22.6,
        "trend": "worsening",
    },
    {
        "id": "astana-almaty-district",
        "name": "Almaty District",
        "city": "astana",
        "avg_rent_1br": 155000,
        "avg_rent_2br": 250000,
        "avg_salary": 520000,
        "population": 310000,
        "lat": 51.1800,
        "lng": 71.4350,
        "rent_change_pct": 6.8,
        "trend": "stable",
    },
    {
        "id": "astana-saryarka",
        "name": "Saryarka",
        "city": "astana",
        "avg_rent_1br": 145000,
        "avg_rent_2br": 235000,
        "avg_salary": 540000,
        "population": 270000,
        "lat": 51.1600,
        "lng": 71.4700,
        "rent_change_pct": 5.4,
        "trend": "stable",
    },
    {
        "id": "astana-nura",
        "name": "Nura",
        "city": "astana",
        "avg_rent_1br": 130000,
        "avg_rent_2br": 215000,
        "avg_salary": 495000,
        "population": 155000,
        "lat": 51.1300,
        "lng": 71.3900,
        "rent_change_pct": 3.9,
        "trend": "improving",
    },
    {
        "id": "astana-baikonur",
        "name": "Baikonur",
        "city": "astana",
        "avg_rent_1br": 118000,
        "avg_rent_2br": 195000,
        "avg_salary": 475000,
        "population": 130000,
        "lat": 51.1950,
        "lng": 71.4900,
        "rent_change_pct": 2.7,
        "trend": "improving",
    },
]


def _risk_level(ratio: float) -> str:
    if ratio < 0.30:
        return "safe"
    if ratio < 0.50:
        return "moderate"
    return "dangerous"


def _affordability_index(ratio: float) -> int:
    return max(0, min(100, int((1 - ratio) * 100)))


def build_districts() -> list[District]:
    result = []
    for d in DISTRICTS_DATA:
        ratio = d["avg_rent_1br"] / d["avg_salary"]
        result.append(
            District(
                **d,
                affordability_ratio=round(ratio, 4),
                affordability_index=_affordability_index(ratio),
                risk_level=_risk_level(ratio),
            )
        )
    return result


def get_districts(city: str | None = None) -> list[District]:
    districts = build_districts()
    if city:
        return [d for d in districts if d.city == city.lower()]
    return districts


def get_district_by_id(district_id: str) -> District | None:
    districts = build_districts()
    return next((d for d in districts if d.id == district_id), None)
