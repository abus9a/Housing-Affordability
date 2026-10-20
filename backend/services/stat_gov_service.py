import json
import time
import httpx

DATA_EGOV_BASE = "https://data.egov.kz/api/v4"
# Average monthly nominal wage by region (Bureau of National Statistics dataset)
WAGE_DATASET = "ds060101_01_actual"

# Fallback city salaries (KZT/month) based on published national statistics
# Almaty and Astana are ~30-50% above the national average of ~423,000 KZT
FALLBACK_CITY_SALARIES = {
    "almaty": 580_000,
    "astana": 620_000,
}

# Kazakh/Russian names used in stat.gov.kz regional data
_CITY_ALIASES = {
    "almaty": ["Алматы", "Almaty", "г. Алматы", "г.Алматы"],
    "astana": ["Астана", "Astana", "г. Астана", "г.Астана", "Нур-Султан"],
}

_cache: dict[str, tuple[int, float]] = {}
_CACHE_TTL = 3600  # 1 hour


def _parse_salary(entry: dict) -> int | None:
    for key in ("avg_salary", "value", "salary", "wage", "znach"):
        val = entry.get(key)
        if val is not None:
            try:
                return int(float(val))
            except (TypeError, ValueError):
                pass
    return None


def _matches_city(entry: dict, city: str) -> bool:
    aliases = _CITY_ALIASES.get(city, [])
    for key in ("region_name", "name", "name_ru", "name_kz", "region", "oblast"):
        field_val = str(entry.get(key) or "")
        if any(alias in field_val for alias in aliases):
            return True
    return False


async def get_city_avg_salary(city: str) -> tuple[int, str]:
    """Return (avg_salary_kzt, source) where source is 'stat.gov.kz' or 'fallback'."""
    city = city.lower()

    cached = _cache.get(city)
    if cached and time.time() - cached[1] < _CACHE_TTL:
        return cached[0], "stat.gov.kz"

    try:
        source_param = json.dumps({"Page": 1, "Limit": 100})
        url = f"{DATA_EGOV_BASE}/{WAGE_DATASET}?source={source_param}"
        async with httpx.AsyncClient() as client:
            r = await client.get(url, timeout=8.0)
            r.raise_for_status()
            data = r.json()

        entries = data if isinstance(data, list) else data.get("data") or data.get("items") or []
        for entry in entries:
            if _matches_city(entry, city):
                salary = _parse_salary(entry)
                if salary and salary > 100_000:
                    _cache[city] = (salary, time.time())
                    return salary, "stat.gov.kz"
    except Exception:
        pass

    return FALLBACK_CITY_SALARIES.get(city, 500_000), "fallback"
