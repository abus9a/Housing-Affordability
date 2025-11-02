from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import cities, analysis

app = FastAPI(title="Housing Affordability Intelligence", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cities.router)
app.include_router(analysis.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
