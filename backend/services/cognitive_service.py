"""
cognitive_service.py – scoring + Groq-powered question generation for all 5 mini tests.
"""
import os, json, random
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# ═══════════════════════════════════════════════════════════════════════════════
# 1. MEMORY RECALL — Groq generates a themed word set
# ═══════════════════════════════════════════════════════════════════════════════

FALLBACK_WORD_LISTS = [
    ["apple", "river", "candle", "doctor", "purple"],
    ["tiger", "bridge", "butter", "music",  "garden"],
    ["cloud", "pencil", "orange", "mother", "window"],
    ["horse", "silver", "coffee", "sunset", "mirror"],
    ["piano", "castle", "forest", "lemon",  "umbrella"],
]

async def generate_memory_words() -> dict:
    """Groq generates 5 easy, distinct common-noun words themed around everyday life."""
    try:
        resp = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{
                "role": "user",
                "content": (
                    "Generate exactly 5 simple, common English nouns (1-2 syllables, everyday objects "
                    "or concepts) suitable for a memory test for elderly patients. "
                    "Return ONLY a JSON array of 5 strings. Example: [\"apple\", \"river\", \"candle\", \"doctor\", \"purple\"]. "
                    "No markdown, no explanation."
                )
            }],
            temperature=0.9, max_tokens=60,
        )
        raw = resp.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].split("```")[0].replace("json","").strip()
        words = json.loads(raw)
        if isinstance(words, list) and len(words) >= 5:
            return {"words": [str(w).lower().strip() for w in words[:5]], "count": 5}
    except Exception as e:
        print(f"[Groq memory words error] {e}")
    # Fallback
    w = random.choice(FALLBACK_WORD_LISTS)
    return {"words": w, "count": len(w)}


def score_memory_recall(original: list, recalled: list) -> dict:
    orig   = [w.lower().strip() for w in original]
    recall = [w.lower().strip() for w in recalled if w.strip()]

    exact   = sum(1 for w in recall if w in orig)
    partial = sum(1 for w in recall if any(w[:4] == o[:4] for o in orig) and w not in orig)

    points = exact + partial * 0.5
    score  = round(min(100, (points / len(orig)) * 100), 1) if orig else 0

    return {
        "score": score,
        "exact_correct":   exact,
        "partial_correct": partial,
        "total_words":     len(orig),
        "correct_words":   [w for w in recall if w in orig],
        "missed_words":    [w for w in orig if w not in recall],
        "interpretation": (
            "Excellent memory recall — within normal range."              if score >= 80 else
            "Moderate recall — some words were forgotten."                if score >= 60 else
            "Below average recall this session."                          if score >= 40 else
            "Low recall detected. Suggest re-testing when rested."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 2. REACTION TIME — pure frontend timing; backend only scores
# ═══════════════════════════════════════════════════════════════════════════════

def score_reaction_time(times_ms: list) -> dict:
    if not times_ms:
        return {"score": 0, "avg_ms": 0, "interpretation": "No data provided."}

    valid = [t for t in times_ms if 80 <= t <= 3000] or times_ms
    avg   = round(sum(valid) / len(valid), 1)
    var   = (sum((t - avg)**2 for t in valid) / len(valid)) ** 0.5
    std   = round(var, 1)

    if avg <= 200:   raw = 100.0
    elif avg <= 300: raw = 100 - (avg - 200) * 0.30
    elif avg <= 500: raw = 70  - (avg - 300) * 0.20
    elif avg <= 800: raw = 30  - (avg - 500) * 0.05
    else:            raw = max(0, 15 - (avg - 800) * 0.02)

    if std > 200: raw -= 10
    elif std > 100: raw -= 5

    score = round(max(0, min(100, raw)), 1)
    return {
        "score":     score,
        "avg_ms":    avg,
        "stdev_ms":  std,
        "trials":    len(valid),
        "interpretation": (
            "Excellent — fast and consistent."                              if score >= 80 else
            "Adequate — mild slowing detected."                             if score >= 60 else
            "Below average response speed."                                 if score >= 40 else
            "Low response speed detected."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. NUMBER SEQUENCE — Groq generates meaningful patterns
# ═══════════════════════════════════════════════════════════════════════════════

FALLBACK_SEQUENCES = [
    {"sequence": [2,  4,  6,  8],     "answer": 10, "rule": "Even numbers (+2 each step)"},
    {"sequence": [3,  6,  9,  12],    "answer": 15, "rule": "Multiples of 3"},
    {"sequence": [1,  4,  9,  16],    "answer": 25, "rule": "Perfect squares (n²)"},
    {"sequence": [5,  10, 20, 40],    "answer": 80, "rule": "Doubling each step (×2)"},
    {"sequence": [100,93, 86, 79],    "answer": 72, "rule": "Subtracting 7 each step"},
    {"sequence": [1,  1,  2,  3,  5], "answer": 8,  "rule": "Fibonacci sequence"},
    {"sequence": [2,  6,  12, 20],    "answer": 30, "rule": "n×(n+1) pattern"},
    {"sequence": [64, 32, 16, 8],     "answer": 4,  "rule": "Halving each step (÷2)"},
    {"sequence": [7,  14, 21, 28],    "answer": 35, "rule": "Multiples of 7"},
    {"sequence": [1,  3,  6,  10],    "answer": 15, "rule": "Triangular numbers"},
]

async def generate_number_sequence() -> dict:
    """Groq generates a number pattern at random difficulty."""
    difficulty = random.choice(["easy", "medium", "hard"])
    try:
        resp = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{
                "role": "user",
                "content": (
                    f"Generate a {difficulty}-difficulty number sequence for a cognitive test. "
                    "The sequence must have 4-5 numbers shown, plus one correct next number, and a short rule description. "
                    "Return ONLY this JSON (no markdown): "
                    "{\"sequence\": [list of 4-5 ints], \"answer\": int, \"rule\": \"short description\"} "
                    "Ensure the arithmetic is 100% correct."
                )
            }],
            temperature=0.7, max_tokens=120,
        )
        raw = resp.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].split("```")[0].replace("json","").strip()

        # Handle potential surrounding text before/after the JSON
        start = raw.find("{")
        end   = raw.rfind("}") + 1
        if start >= 0 and end > start:
            raw = raw[start:end]

        d = json.loads(raw)
        if "sequence" in d and "answer" in d and "rule" in d:
            return {
                "sequence": [int(x) for x in d["sequence"]],
                "answer":   int(d["answer"]),
                "rule":     str(d["rule"]),
            }
    except Exception as e:
        print(f"[Groq sequence error] {e}")

    return random.choice(FALLBACK_SEQUENCES)


def score_number_sequence(correct_answer: int, user_answer: int, time_sec: float) -> dict:
    correct = int(user_answer) == int(correct_answer)
    if not correct:
        score = 0.0
        label = "Incorrect"
    else:
        if time_sec <= 10:   base = 100.0
        elif time_sec <= 20: base = 100 - (time_sec - 10) * 2
        elif time_sec <= 30: base = 80  - (time_sec - 20) * 2
        else:                base = max(60, 60 - (time_sec - 30) * 0.5)
        score = round(base, 1)
        label = "Correct"

    return {
        "score":          score,
        "correct":        correct,
        "given_answer":   user_answer,
        "correct_answer": correct_answer,
        "time_taken_sec": round(time_sec, 1),
        "interpretation": (
            f"{label}! Strong logical reasoning."     if score >= 80 else
            f"{label}! Adequate reasoning."           if score >= 60 else
            f"{label} — slowed processing speed."
        ) if correct else
        "Incorrect — difficulty with number patterns detected.",
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 4. WORD FLUENCY — Groq picks a unique category each time
# ═══════════════════════════════════════════════════════════════════════════════

FALLBACK_FLUENCY = [
    {"category": "B",       "instruction": "Say as many words as you can starting with the letter B"},
    {"category": "F",       "instruction": "Say as many words as you can starting with the letter F"},
    {"category": "S",       "instruction": "Say as many words as you can starting with the letter S"},
    {"category": "Animals", "instruction": "Name as many animals as you can"},
    {"category": "Fruits",  "instruction": "Name as many fruits and vegetables as you can"},
    {"category": "Jobs",    "instruction": "Name as many jobs or professions as you can"},
    {"category": "Colors",  "instruction": "Name as many colours as you can"},
    {"category": "Foods",   "instruction": "Name as many foods you can eat for breakfast"},
]

async def get_fluency_prompt() -> dict:
    """Groq picks a creative, varied category for word fluency."""
    try:
        resp = client.chat.completions.create(
            model="llama3-70b-8192",
            messages=[{
                "role": "user",
                "content": (
                    "Pick ONE unique word fluency category for a cognitive test (suitable for elderly patients). "
                    "It could be a letter of the alphabet, a semantic category (animals, foods, jobs, places, etc.), "
                    "or a themed group. Return ONLY this JSON: "
                    "{\"category\": \"short category name\", \"instruction\": \"full instruction sentence\"} "
                    "No markdown, no explanation."
                )
            }],
            temperature=0.95, max_tokens=80,
        )
        raw = resp.choices[0].message.content.strip()
        if "```" in raw:
            raw = raw.split("```")[1].split("```")[0].replace("json","").strip()
        start = raw.find("{"); end = raw.rfind("}") + 1
        if start >= 0 and end > start:
            raw = raw[start:end]
        d = json.loads(raw)
        if "category" in d and "instruction" in d:
            return {"category": str(d["category"]), "instruction": str(d["instruction"])}
    except Exception as e:
        print(f"[Groq fluency prompt error] {e}")
    return random.choice(FALLBACK_FLUENCY)


def score_word_fluency(words: list, category: str, time_sec: int = 30) -> dict:
    clean  = [w.lower().strip().strip(".,!?") for w in words if w.strip()]
    unique = list(dict.fromkeys(clean))
    count  = len(unique)
    rpm    = round((count / time_sec) * 60, 1) if time_sec > 0 else 0

    if count >= 12: score = 100.0
    elif count >= 9: score = 85 + (count - 9) * 5
    elif count >= 6: score = 65 + (count - 6) * 6.67
    elif count >= 3: score = 40 + (count - 3) * 8.33
    elif count >= 1: score = 15 + (count - 1) * 12.5
    else:            score = 0.0

    score = round(min(100, score), 1)
    return {
        "score":          score,
        "word_count":     count,
        "unique_words":   unique,
        "rate_per_min":   rpm,
        "category":       category,
        "interpretation": (
            "Excellent verbal fluency — strong language retrieval."              if score >= 80 else
            "Good verbal fluency — within normal range."                         if score >= 60 else
            "Reduced fluency — word retrieval was below average."                if score >= 40 else
            "Poor verbal fluency — word-finding difficulty detected."
        ),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 5. PATTERN MATCHING — pure frontend; backend just scores
# ═══════════════════════════════════════════════════════════════════════════════

def score_pattern_matching(correct: int, total: int, avg_ms: float) -> dict:
    if total <= 0:
        return {"score": 0, "interpretation": "No data."}

    acc_pct = (correct / total) * 100
    acc_sc  = acc_pct

    if avg_ms <= 400:    spd = 100.0
    elif avg_ms <= 700:  spd = 100 - (avg_ms - 400) * (40 / 300)
    elif avg_ms <= 1200: spd = 60  - (avg_ms - 700) * (30 / 500)
    elif avg_ms <= 2000: spd = 30  - (avg_ms - 1200) * (20 / 800)
    else:                spd = max(0, 10 - (avg_ms - 2000) * 0.005)

    score = round(max(0, min(100, acc_sc * 0.6 + spd * 0.4)), 1)
    return {
        "score":           score,
        "correct":         correct,
        "total":           total,
        "accuracy_pct":    round(acc_pct, 1),
        "avg_response_ms": round(avg_ms, 1),
        "accuracy_score":  round(acc_sc, 1),
        "speed_score":     round(spd, 1),
        "interpretation": (
            "Excellent — fast and accurate pattern recognition."                 if score >= 80 else
            "Good — mild slowness or minor errors."                              if score >= 60 else
            "Reduced — attention may have wavered."                              if score >= 40 else
            "Poor — below average visual-cognitive performance."
        ),
    }
