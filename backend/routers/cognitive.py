"""
cognitive.py — Router for all 5 mini cognitive tests.
Generate endpoints call Groq AI; score endpoints compute clinically-grounded 0-100 scores.
"""
from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from services.cognitive_service import (
    generate_memory_words, score_memory_recall,
    score_reaction_time,
    generate_number_sequence, score_number_sequence,
    get_fluency_prompt, score_word_fluency,
    score_pattern_matching,
)

router = APIRouter()


# ═══════════════════════════════════════════════════════════════════════════════
# 1. MEMORY RECALL
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/memory-recall/generate")
async def memory_generate():
    """Groq LLaMA generates 5 unique everyday words for the memory test."""
    return await generate_memory_words()


class MemoryRecallSubmit(BaseModel):
    original_words: List[str]
    recalled_words: List[str]

@router.post("/memory-recall/score")
def memory_score(body: MemoryRecallSubmit):
    """Score recalled words vs original words (exact + partial credit)."""
    return score_memory_recall(body.original_words, body.recalled_words)


# ═══════════════════════════════════════════════════════════════════════════════
# 2. REACTION TIME
# ═══════════════════════════════════════════════════════════════════════════════

class ReactionTimeSubmit(BaseModel):
    reaction_times_ms: List[float]

@router.post("/reaction-time/score")
def reaction_score(body: ReactionTimeSubmit):
    """Score avg reaction time and consistency. Normal adult: 150–300ms avg."""
    return score_reaction_time(body.reaction_times_ms)


# ═══════════════════════════════════════════════════════════════════════════════
# 3. NUMBER SEQUENCE
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/number-sequence/generate")
async def sequence_generate():
    """Groq LLaMA generates a number pattern puzzle at random difficulty."""
    return await generate_number_sequence()


class SequenceSubmit(BaseModel):
    correct_answer:  int
    user_answer:     int
    time_taken_sec:  float

@router.post("/number-sequence/score")
def sequence_score(body: SequenceSubmit):
    """Score correctness + speed. Correct + fast = 100, incorrect = 0."""
    return score_number_sequence(body.correct_answer, body.user_answer, body.time_taken_sec)


# ═══════════════════════════════════════════════════════════════════════════════
# 4. WORD FLUENCY
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/word-fluency/prompt")
async def fluency_prompt():
    """Groq LLaMA picks a unique semantic or letter category each time."""
    return await get_fluency_prompt()


class FluencySubmit(BaseModel):
    words:          List[str]
    category:       str
    time_limit_sec: int = 30

@router.post("/word-fluency/score")
def fluency_score(body: FluencySubmit):
    """Score unique words entered within the time limit (≥10 words = 100)."""
    return score_word_fluency(body.words, body.category, body.time_limit_sec)


# ═══════════════════════════════════════════════════════════════════════════════
# 5. PATTERN MATCHING
# ═══════════════════════════════════════════════════════════════════════════════

class PatternSubmit(BaseModel):
    correct: int
    total:   int
    avg_ms:  float

@router.post("/pattern-matching/score")
def pattern_score(body: PatternSubmit):
    """Score accuracy (60%) + response speed (40%)."""
    return score_pattern_matching(body.correct, body.total, body.avg_ms)
