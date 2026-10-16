import random
from fastapi import APIRouter, UploadFile, File, Form
from services.groq_service import transcribe_audio, analyze_speech

router = APIRouter()

DAILY_RECALL_PROMPT = {
    "id":   "daily_recall",
    "type": "daily_recall",
    "text": "Please tell me about your day today — what did you do, what did you eat, who did you meet? Take your time, there's no rush.",
}

COGNITIVE_PROMPTS = [
    "Can you name as many animals as possible? Try to name as many as you can think of.",
    "Please describe your home to me — what does each room look like?",
    "Tell me about your earliest childhood memory in as much detail as you can remember.",
    "Describe step-by-step how you would make a cup of tea or coffee.",
    "Can you tell me the names of all the people in your immediate family?",
    "Please count backwards from 20 to 1 for me.",
    "Tell me about a place you love visiting, and why you love it there.",
    "Can you name five different vegetables and describe what they look like?",
    "Tell me what a typical morning looks like for you from when you wake up.",
    "Can you describe what happened in a TV show or story you enjoyed recently?",
]


@router.get("/prompts")
def get_prompts():
    return {
        "prompt_1": DAILY_RECALL_PROMPT,
        "prompt_2": {
            "id":   "cognitive",
            "type": "cognitive",
            "text": random.choice(COGNITIVE_PROMPTS),
        },
    }


@router.post("/analyze")
async def analyze(
    audio:       UploadFile = File(...),
    prompt_type: str        = Form(...),
    prompt_text: str        = Form(""),
):
    """
    Full pipeline:
    1. Groq Whisper transcribes audio with word-level timestamps
    2. Real pause / filler / WPM metrics extracted from timestamps
    3. Groq LLaMA performs qualitative analysis
    4. Weighted composite score (0-100) computed with breakdown
    Returns everything needed by the frontend to display results
    and save the session to Firestore.
    """
    audio_bytes = await audio.read()
    filename    = audio.filename or "recording.webm"

    # Step 1 — Transcribe
    transcription = await transcribe_audio(audio_bytes, filename)
    transcript    = transcription["transcript"]
    words         = transcription["words"]
    duration      = transcription["duration"]

    # Step 2+3+4 — Analyse + score
    analysis = await analyze_speech(
        transcript  = transcript,
        words       = words,
        duration    = duration,
        prompt_type = prompt_type,
        prompt_text = prompt_text,
    )

    return {
        # ── Speech-to-text output ──
        "transcript":   transcript,
        "words":        words,          # word-level timestamps
        "duration":     duration,
        # ── Full analysis ──
        "analysis":     analysis,
        # ── Echo back the prompt so frontend can pair them ──
        "prompt_type":  prompt_type,
        "prompt_text":  prompt_text,
    }
