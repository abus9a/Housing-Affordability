# Housing Affordability Intelligence

An interactive web app that shows how affordable housing is across the districts of **Almaty** and **Astana** (Kazakhstan). It compares average rent with local salaries, puts the results on a map, and uses Google Gemini to explain what the numbers mean for residents.

## Features

- **Interactive map**: districts are color-coded by affordability risk (Leaflet / OpenStreetMap).
- **City overview**: average rent, average salary, the affordability index, and how many districts fall into each risk level.
- **District details**: 1BR and 2BR rent, salary, rent-to-income ratio, yearly rent change and trend.
- **Affordability chart**: compares all districts in a city side by side (Recharts).
- **Personal calculator**: enter your monthly salary to see which districts are affordable, borderline or expensive for you, with a written recommendation.
- **AI insights**: Gemini-generated analysis of a district or city, plus free-form Q&A about the housing market.
- **Macro context**: Kazakhstan GDP per capita and unemployment rate, pulled live from the World Bank API.

## How affordability is measured

For each district, the app uses the average 1-bedroom rent and the average monthly salary:

| Metric | Formula |
| --- | --- |
| Affordability ratio | `avg_rent_1br / avg_salary` |
| Affordability index (0–100) | `(1 − ratio) × 100`, clamped to 0–100 |

| Risk level | Rent share of income |
| --- | --- |
| 🟢 Safe | below 30% |
| 🟡 Moderate | 30–50% |
| 🔴 Dangerous | above 50% |

The 30% threshold follows the widely used "30% rule" for housing costs.

## Tech stack

| Layer | Technologies |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, React Leaflet, Recharts, lucide-react |
| Backend | Python, FastAPI, Pydantic, httpx, Uvicorn |
| AI | Google Gemini (`google-generativeai`) |
| External data | World Bank Indicators API |

## Project structure

```
.
├── backend/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── config.py                # Settings loaded from .env
│   ├── models.py                # Pydantic schemas
│   ├── requirements.txt
│   ├── routers/
│   │   ├── cities.py            # City list, districts, city stats
│   │   └── analysis.py          # AI analysis, personal calculator, Q&A
│   └── services/
│       ├── housing_service.py   # District dataset and affordability scoring
│       ├── gemini_service.py    # Gemini prompts and calls
│       ├── world_bank_service.py# GDP / unemployment indicators
│       └── stat_gov_service.py  # Salary lookup via data.egov.kz (with fallback)
└── frontend/
    └── src/
        ├── app/                 # layout.tsx, page.tsx, globals.css
        ├── components/          # Map, charts, panels, calculator, AI insights
        └── lib/                 # API client and shared types
```

## Getting started

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm
- A Google Gemini API key ([Google AI Studio](https://aistudio.google.com/app/apikey))

### 1. Backend

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # then set GEMINI_API_KEY in .env
uvicorn main:app --reload --port 8000
```

The API runs at `http://localhost:8000`. Interactive docs are at `http://localhost:8000/docs`.

### 2. Frontend

```bash
cd frontend
npm install
cp .env.local.example .env.local # NEXT_PUBLIC_API_URL=http://localhost:8000
npm run dev
```

Open `http://localhost:3000`.

> The backend only accepts CORS requests from `http://localhost:3000`. If you serve the frontend from a different origin, update `allow_origins` in [backend/main.py](backend/main.py).

## Environment variables

| File | Variable | Description |
| --- | --- | --- |
| `backend/.env` | `GEMINI_API_KEY` | Google Gemini API key (required) |
| `frontend/.env.local` | `NEXT_PUBLIC_API_URL` | Backend base URL (default `http://localhost:8000`) |

## API reference

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/health` | Health check |
| GET | `/api/cities` | Supported cities with map center and zoom |
| GET | `/api/cities/{city}/districts` | All districts of a city with affordability metrics |
| GET | `/api/cities/{city}/stats` | Aggregated city statistics |
| GET | `/api/analysis/district/{district_id}` | AI analysis and key insight for a district |
| GET | `/api/analysis/city/{city}` | AI analysis for a whole city |
| POST | `/api/analysis/personal` | Personal affordability breakdown for a given salary |
| POST | `/api/analysis/query` | Free-form question about the housing market |

`{city}` is `almaty` or `astana`. District IDs look like `almaty-medeu` or `astana-esil`.

Example requests:

```bash
curl -X POST http://localhost:8000/api/analysis/personal \
  -H "Content-Type: application/json" \
  -d '{"salary": 500000, "city": "almaty"}'

curl -X POST http://localhost:8000/api/analysis/query \
  -H "Content-Type: application/json" \
  -d '{"question": "Which Astana district is cheapest to rent in?", "city": "astana"}'
```

## Data sources and limitations

- **District rent and salary figures** are a curated static dataset in [backend/services/housing_service.py](backend/services/housing_service.py). They are based on 2024–2025 rental market data for Almaty and Astana and on regional wage data from the Bureau of National Statistics of Kazakhstan. District salaries are estimates that reflect each district's local industry mix. All amounts are in KZT per month.
- **Macroeconomic indicators** (GDP per capita, unemployment) come live from the [World Bank API](https://data.worldbank.org/country/kazakhstan).
- **AI-generated text** comes from a language model. It can contain mistakes and should not be treated as financial advice.
- Only Almaty (8 districts) and Astana (5 districts) are covered for now.


