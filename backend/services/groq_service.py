import os
import json
import re
from io import BytesIO
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

FILLER_PATTERNS = re.compile(
    r'\b(uh+|um+|hmm+|hm+|ahh?|ohh?|err+|like|you know|i mean|basically|'
    r'sort of|kind of|right\?|okay so|so+|well+|mm+|mmm+)\b',
    re.IGNORECASE
)
REPEATED_WORD_PATTERN = re.compile(r'\b(\w+)\s+\1\b', re.IGNORECASE)


def _count_fillers(transcript: str) -> int:
    return len(FILLER_PATTERNS.findall(transcript))


def _count_repetitions(transcript: str) -> int:
    return len(REPEATED_WORD_PATTERN.findall(transcript))


def _extract_pause_stats(words: list) -> dict:
    if not words or len(words) < 2:
        return {"pause_count": 0, "longest_pause": 0.0, "pause_list": []}
    pauses = []
    for i in range(1, len(words)):
        gap = round(words[i]["start"] - words[i - 1]["end"], 2)
        if gap >= 0.5:
            pauses.append(gap)
    return {
        "pause_count":  len(pauses),
        "longest_pause": max(pauses, default=0.0),
        "pause_list":   sorted(pauses, reverse=True)[:5],
    }


def _compute_wpm(words: list, transcript: str) -> int:
    if words and len(words) >= 2:
        dur = (words[-1]["end"] - words[0]["start"]) / 60
        if dur > 0:
            return round(len(words) / dur)
    wc = len(transcript.split())
    return round(wc / 2) if wc > 0 else 100


# ─────────────────────────────────────────────────────────────────────────────
# SCORE FUNCTIONS (each returns 0–100)
# ─────────────────────────────────────────────────────────────────────────────

def _score_wpm(wpm: int) -> float:
    """Ideal conversational range: 100–160 WPM."""
    if wpm <= 0:   return 25.0
    if wpm < 30:   return 10.0          # Extremely slow — strong impairment signal
    if wpm < 60:   return 10 + (wpm - 30) * (30 / 30)   # 10→40
    if wpm < 100:  return 40 + (wpm - 60) * (40 / 40)   # 40→80
    if wpm <= 160: return 80 + (wpm - 100) * (20 / 60)  # 80→100 (ideal)
    if wpm <= 200: return 100 - (wpm - 160) * (20 / 40) # 100→80
    return max(40.0, 80.0 - (wpm - 200) * 0.4)


def _score_pause_count(count: int, duration_sec: float) -> float:
    """Rate per minute; 0–2/min = normal."""
    if duration_sec <= 0: duration_sec = 60
    ppm = (count / duration_sec) * 60
    if ppm <= 2:  return 100.0
    if ppm <= 5:  return 100 - (ppm - 2) * 15
    return max(0, 55 - (ppm - 5) * 10)


def _score_longest_pause(longest: float) -> float:
    """Clinical penalty for a single very long pause."""
    if longest < 1.0: return 100.0
    if longest < 2.0: return 90.0
    if longest < 3.0: return 75.0
    if longest < 5.0: return 60.0
    if longest < 8.0: return 35.0
    return max(0, 35 - (longest - 8) * 5)


def _score_fillers(count: int, word_count: int) -> float:
    """Rate per 100 words; ≤3 = normal."""
    if word_count <= 0: word_count = 1
    r = (count / word_count) * 100
    if r <= 3:  return 100.0
    if r <= 8:  return 100 - (r - 3) * 10
    return max(0, 50 - (r - 8) * 5)


def _score_repetitions(count: int, word_count: int) -> float:
    if word_count <= 0: word_count = 1
    r = (count / word_count) * 100
    if r == 0:  return 100.0
    if r <= 2:  return 85.0
    if r <= 5:  return 65.0
    return max(0, 65 - (r - 5) * 8)


# ─────────────────────────────────────────────────────────────────────────────
# COMPOSITE SCORE  (weights must sum to 1.0)
# ─────────────────────────────────────────────────────────────────────────────
SCORE_WEIGHTS = {
    "speaking_rate":      0.12,
    "pause_penalty":      0.15,
    "longest_pause":      0.13,
    "filler_penalty":     0.08,
    "repetition_penalty": 0.07,
    "response_adequacy":  0.15,   # NEW — penalises non-answers
    "coherence":          0.13,
    "vocabulary":         0.10,
    "topic_maintenance":  0.07,
}

SCORE_LABELS = {
    "speaking_rate":      "Speaking Rate (WPM)",
    "pause_penalty":      "Pause Frequency",
    "longest_pause":      "Longest Single Pause",
    "filler_penalty":     "Filler Word Usage",
    "repetition_penalty": "Word Repetitions",
    "response_adequacy":  "Response Adequacy",
    "coherence":          "Coherence",
    "vocabulary":         "Vocabulary Richness",
    "topic_maintenance":  "Topic Maintenance",
}


def compute_overall_score(
    wpm, pause_count, longest_pause, filler_count,
    repetition_count, coherence, vocabulary, topic_maintenance,
    response_adequacy, duration_sec, transcript,
) -> dict:
    wc = len(transcript.split())
    components = {
        "speaking_rate":      _score_wpm(wpm),
        "pause_penalty":      _score_pause_count(pause_count, duration_sec),
        "longest_pause":      _score_longest_pause(longest_pause),
        "filler_penalty":     _score_fillers(filler_count, wc),
        "repetition_penalty": _score_repetitions(repetition_count, wc),
        "response_adequacy":  (response_adequacy / 10) * 100,
        "coherence":          (coherence / 10) * 100,
        "vocabulary":         (vocabulary / 10) * 100,
        "topic_maintenance":  (topic_maintenance / 10) * 100,
    }
    total = sum(components[k] * SCORE_WEIGHTS[k] for k in SCORE_WEIGHTS)
    overall = round(min(100, max(0, total)), 1)

    breakdown = [
        {
            "component":    SCORE_LABELS[k],
            "raw_score":    round(components[k], 1),
            "weight_pct":   round(SCORE_WEIGHTS[k] * 100, 0),
            "contribution": round(components[k] * SCORE_WEIGHTS[k], 2),
        }
        for k in SCORE_WEIGHTS
    ]
    return {"overall_score": overall, "breakdown": breakdown}


# ─────────────────────────────────────────────────────────────────────────────
# TRANSCRIPTION
# ─────────────────────────────────────────────────────────────────────────────
async def transcribe_audio(audio_bytes: bytes, filename: str = "recording.webm") -> dict:
    buf = BytesIO(audio_bytes)
    buf.name = filename
    t = client.audio.transcriptions.create(
        file=(filename, buf, "audio/webm"),
        model="whisper-large-v3",
        response_format="verbose_json",
        timestamp_granularities=["word"],
        prompt=(
            "Transcribe exactly as spoken. Keep all filler words: "
            "uh, um, hmm, ah, oh, err, like, you know. Do not clean up."
        ),
    )
    text  = t.text or ""
    words = []
    if hasattr(t, "words") and t.words:
        for w in t.words:
            words.append({
                "word":  w.word  if hasattr(w, "word")  else str(w),
                "start": float(w.start) if hasattr(w, "start") else 0.0,
                "end":   float(w.end)   if hasattr(w, "end")   else 0.0,
            })
    dur = 0.0
    if hasattr(t, "duration"):   dur = float(t.duration)
    elif words:                   dur = words[-1]["end"]
    return {"transcript": text.strip(), "words": words, "duration": dur}


# ─────────────────────────────────────────────────────────────────────────────
# SPEECH ANALYSIS  (quantitative + LLaMA qualitative)
# ─────────────────────────────────────────────────────────────────────────────
async def analyze_speech(
    transcript: str, words: list, duration: float,
    prompt_type: str, prompt_text: str = "",
) -> dict:
    pause_stats       = _extract_pause_stats(words)
    real_pause_count  = pause_stats["pause_count"]
    real_longest      = pause_stats["longest_pause"]
    real_fillers      = _count_fillers(transcript)
    real_repetitions  = _count_repetitions(transcript)
    real_wpm          = _compute_wpm(words, transcript)
    word_count        = len(transcript.split()) if transcript else 0

    # ── LLaMA qualitative + adequacy scoring ─────────────────────────────────
    sys_prompt = """You are a strict clinical cognitive health analyst specialising in early Alzheimer's and dementia detection through speech analysis.

IMPORTANT SCORING RULES:
1. A LOW score means BETTER cognitive health. A HIGH score means MORE cognitive concern.
   Wait — actually scores are 0-10 where 10 = perfectly healthy, 0 = severe impairment. Score accordingly.
2. If the patient says "I don't remember", "I can't recall", "I don't know" or gives a very short/vague answer (under 15 words),
   that IS clinically significant. Score topic_maintenance, coherence, and response_adequacy VERY LOW (1-3/10).
3. A dismissive or avoidant answer is a red flag — it does not mean good fluency. Do NOT give high scores just because there are no fillers.
4. Score strictly. A healthy adult should score 7-9. A dismissive/confused answer should score 2-4.
5. response_adequacy specifically measures: did the patient actually answer the question with substantive content?
   "I don't remember" = 1/10. A detailed answer = 9/10.

Return ONLY this JSON (no markdown):
{
  "coherence_score": <float 0-10>,
  "vocabulary_richness": <float 0-10>,
  "topic_maintenance": <float 0-10>,
  "response_adequacy": <float 0-10 — DID THEY ACTUALLY ANSWER THE QUESTION?>,
  "sentiment": <"positive"|"neutral"|"negative">,
  "cognitive_flags": <list of clinical concern strings. Include "Refused to engage with question" or "Extremely limited response" if applicable>,
  "pause_interpretation": <1 sentence about what the longest pause of Xs implies clinically>,
  "summary": <2-3 sentence clinical narrative referencing: longest pause, WPM, response adequacy, overall cognitive impression>
}"""

    usr_msg = f"""Prompt type: {prompt_type}
Question asked: "{prompt_text}"

Objective audio metrics from Whisper timestamps:
- Word count in response: {word_count}
- Pauses ≥0.5s: {real_pause_count}
- LONGEST pause: {real_longest}s
- Filler words: {real_fillers}
- Word repetitions: {real_repetitions}
- Speaking rate: {real_wpm} WPM
- Duration: {round(duration, 1)}s

Patient transcript (EXACTLY as spoken):
"{transcript}"

CRITICAL: If the transcript is very short (under ~15 words), or is a refusal/non-answer like "I don't remember", score response_adequacy, topic_maintenance, and coherence_score VERY LOW (1-3/10). This is a clinical red flag.
Return ONLY the JSON."""

    try:
        resp = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[
                {"role": "system", "content": sys_prompt},
                {"role": "user",   "content": usr_msg},
            ],
            temperature=0.05,
            max_tokens=700,
        )
        content = resp.choices[0].message.content.strip()
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        q = json.loads(content)
    except Exception as ex:
        print(f"[LLaMA error] {ex}")
        # Conservative defaults for short non-answers
        low = word_count < 10
        q = {
            "coherence_score":    2.0 if low else 7.0,
            "vocabulary_richness": 2.0 if low else 7.0,
            "topic_maintenance":   1.0 if low else 7.0,
            "response_adequacy":   1.0 if low else 7.0,
            "sentiment":          "neutral",
            "cognitive_flags":    ["Extremely limited response detected"] if low else [],
            "pause_interpretation": f"Longest pause: {real_longest}s.",
            "summary": "Qualitative analysis unavailable. Very short response was detected.",
        }

    coherence   = float(q.get("coherence_score",     7.0))
    vocabulary  = float(q.get("vocabulary_richness",  7.0))
    topic       = float(q.get("topic_maintenance",    7.0))
    adequacy    = float(q.get("response_adequacy",    7.0))

    # ── Composite score ───────────────────────────────────────────────────────
    score_data = compute_overall_score(
        wpm=real_wpm, pause_count=real_pause_count,
        longest_pause=real_longest, filler_count=real_fillers,
        repetition_count=real_repetitions, coherence=coherence,
        vocabulary=vocabulary, topic_maintenance=topic,
        response_adequacy=adequacy,
        duration_sec=duration, transcript=transcript,
    )

    return {
        # Quantitative
        "pause_count":         real_pause_count,
        "longest_pause_sec":   real_longest,
        "pause_list":          pause_stats["pause_list"],
        "hesitation_markers":  real_fillers,
        "repetition_count":    real_repetitions,
        "speaking_rate_wpm":   real_wpm,
        "audio_duration_sec":  round(duration, 1),
        "word_count":          word_count,
        # Qualitative
        "coherence_score":     coherence,
        "vocabulary_richness": vocabulary,
        "topic_maintenance":   topic,
        "response_adequacy":   adequacy,
        "sentiment":           q.get("sentiment", "neutral"),
        "cognitive_flags":     q.get("cognitive_flags", []),
        "pause_interpretation":q.get(
            "pause_interpretation",
            f"Longest pause recorded: {real_longest}s."
            if real_longest > 0
            else "No significant pauses detected — good speech continuity."
        ),
        "summary":             q.get("summary", ""),
        # Score
        "overall_score":       score_data["overall_score"],
        "score_breakdown":     score_data["breakdown"],
    }
