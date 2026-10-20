import httpx
from models import MacroData

WORLD_BANK_BASE = "https://api.worldbank.org/v2"
COUNTRY = "KAZ"


async def fetch_indicator(client: httpx.AsyncClient, indicator: str) -> tuple[float | None, int | None]:
    url = f"{WORLD_BANK_BASE}/country/{COUNTRY}/indicator/{indicator}?format=json&mrv=3&per_page=3"
    try:
        r = await client.get(url, timeout=8.0)
        r.raise_for_status()
        data = r.json()
        if len(data) < 2 or not data[1]:
            return None, None
        for entry in data[1]:
            if entry.get("value") is not None:
                return entry["value"], entry.get("date") and int(entry["date"])
        return None, None
    except Exception:
        return None, None


async def get_macro_data() -> MacroData:
    async with httpx.AsyncClient() as client:
        gdp_val, gdp_year = await fetch_indicator(client, "NY.GDP.PCAP.CD")
        unem_val, _ = await fetch_indicator(client, "SL.UEM.TOTL.NE.ZS")
        return MacroData(
            gdp_per_capita_usd=round(gdp_val, 2) if gdp_val else None,
            unemployment_pct=round(unem_val, 2) if unem_val else None,
            year=gdp_year,
        )
