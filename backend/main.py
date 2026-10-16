from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import speech, cognitive

app = FastAPI(title="CogniScan API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:5176",
        "http://localhost:5177",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(speech.router,    prefix="/api/speech",    tags=["speech"])
app.include_router(cognitive.router, prefix="/api/cognitive", tags=["cognitive"])


@app.get("/")
def health_check():
    return {"status": "ok", "service": "CogniScan API v2"}
