import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Puzzle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";

// ── Shape/color pattern config ─────────────────────────────────────────────
const SHAPES = ["●", "■", "▲", "◆", "★"];
const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const TOTAL_ROUNDS = 12;

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateRound(target) {
  // If no target provided (initial setup), just return randoms
  if (!target) return null;

  const isMatch = Math.random() > 0.5;
  let displayShape, displayColor;

  if (isMatch) {
    displayShape = target.shape;
    displayColor = target.color;
  } else {
    // Force a non-match
    // 33% diff shape same color, 33% same shape diff color, 34% diff both
    const r = Math.random();
    if (r < 0.33) {
      displayShape = randomItem(SHAPES.filter((s) => s !== target.shape));
      displayColor = target.color;
    } else if (r < 0.66) {
      displayShape = target.shape;
      displayColor = randomItem(COLORS.filter((c) => c !== target.color));
    } else {
      displayShape = randomItem(SHAPES.filter((s) => s !== target.shape));
      displayColor = randomItem(COLORS.filter((c) => c !== target.color));
    }
  }

  return { displayShape, displayColor, isMatch };
}

// phase: intro | active | scoring | result
const PatternMatchTest = () => {
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState(0);
  const [current, setCurrent] = useState(null);
  const [target, setTarget] = useState(null);
  const [correct, setCorrect] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(null);
  const [times, setTimes] = useState([]);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const roundStartRef = useRef(null);

  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";
  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  // ── Start test ─────────────────────────────────────────────────────────────
  const startTest = useCallback(() => {
    setRound(0);
    setCorrect(0);
    setTimes([]);
    setResult(null);
    setSaved(false);
    setAnswered(false);
    setWasCorrect(null);

    // Set a fixed target for the whole session
    const t = { shape: randomItem(SHAPES), color: randomItem(COLORS) };
    setTarget(t);
    loadRound(t, 0);
    setPhase("active");
  }, []);

  const loadRound = useCallback((t, roundNum) => {
    const newRound = generateRound(t);
    setCurrent({
      displayShape: newRound.displayShape,
      displayColor: newRound.displayColor,
      isMatch: newRound.isMatch,
    });
    roundStartRef.current = Date.now();
    setAnswered(false);
    setWasCorrect(null);
  }, []);

  // ── Handle YES / NO tap ────────────────────────────────────────────────────
  const handleAnswer = useCallback(
    async (userSaysMatch) => {
      if (answered) return;
      const elapsed = Date.now() - roundStartRef.current;
      const isRight = userSaysMatch === current.isMatch;

      setAnswered(true);
      setWasCorrect(isRight);
      setTimes((prev) => [...prev, elapsed]);
      if (isRight) setCorrect((c) => c + 1);

      const nextRound = round + 1;

      setTimeout(async () => {
        if (nextRound >= TOTAL_ROUNDS) {
          setPhase("scoring");
          const newTimes = [...times, elapsed];
          const newCorrect = isRight ? correct + 1 : correct;
          const avgMs = newTimes.reduce((s, t) => s + t, 0) / newTimes.length;
          try {
            const r = await fetch(
              `${API}/api/cognitive/pattern-matching/score`,
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  correct: newCorrect,
                  total: TOTAL_ROUNDS,
                  avg_ms: avgMs,
                }),
              },
            );
            const d = await r.json();
            setResult(d);
            setPhase("result");
            saveScore(d.score, d, newTimes);
          } catch {
            setPhase("result");
          }
        } else {
          setRound(nextRound);
          loadRound(target, nextRound);
        }
      }, 600);
    },
    [answered, current, round, times, correct, target, loadRound],
  );

  const saveScore = async (score, meta, rawTimes) => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(db, "cognitive_scores", user.uid, "tests", `pattern_${Date.now()}`),
        {
          testType: "pattern_matching",
          score,
          createdAt: serverTimestamp(),
          metadata: {
            correct: meta.correct,
            total: meta.total,
            accuracyPct: meta.accuracy_pct,
            avgResponseMs: meta.avg_response_ms,
            accuracyScore: meta.accuracy_score,
            speedScore: meta.speed_score,
          },
        },
      );
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  const scoreColor = (s) =>
    s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
          🧩 Pattern Matching Test
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Does the symbol match the target? Tap YES or NO as fast as you can.
        </p>
      </div>

      {/* INTRO */}
      {phase === "intro" && (
        <div className={`${card} rounded-2xl p-8 space-y-6 text-center`}>
          <div className="w-20 h-20 rounded-2xl bg-purple-100 dark:bg-purple-500/20 mx-auto flex items-center justify-center">
            <Puzzle className="w-10 h-10 text-purple-500" />
          </div>
          <div>
            <p className={`font-bold text-lg ${text}`}>How it works</p>
            <p className={`text-sm mt-2 ${sub}`}>
              A <strong>target symbol</strong> is shown at the top. Each round
              shows a new symbol — tap{" "}
              <span className="font-black text-emerald-500">YES</span> if it
              matches the target (same shape AND same colour), or{" "}
              <span className="font-black text-rose-500">NO</span> if it
              doesn't.
              {TOTAL_ROUNDS} rounds total. Speed and accuracy both count.
            </p>
          </div>
          <button
            onClick={startTest}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-purple-600 to-indigo-600 text-white hover:from-purple-700 hover:to-indigo-700 transition-all"
          >
            Start Pattern Test — {TOTAL_ROUNDS} Rounds
          </button>
        </div>
      )}

      {/* ACTIVE */}
      {phase === "active" && target && current && (
        <div className="space-y-4">
          {/* Progress */}
          <div className="flex gap-1.5">
            {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 h-2 rounded-full transition-all ${
                  i < round
                    ? i < correct + (round - correct)
                      ? "bg-indigo-500"
                      : "bg-indigo-500"
                    : isDark
                      ? "bg-[#2d3449]"
                      : "bg-slate-200"
                }`}
              />
            ))}
          </div>

          {/* Target */}
          <div className={`${card} rounded-2xl p-4 flex items-center gap-4`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Match this →
            </p>
            <div className="flex-1 flex justify-center">
              <span
                className="text-5xl font-black transition-all"
                style={{ color: target.color }}
              >
                {target.shape}
              </span>
            </div>
            <p className={`text-xs font-bold tabular-nums ${sub}`}>
              {round + 1} / {TOTAL_ROUNDS}
            </p>
          </div>

          {/* Current symbol */}
          <div
            className={`${card} rounded-3xl p-10 flex flex-col items-center gap-3 transition-all ${
              answered
                ? wasCorrect
                  ? isDark
                    ? "bg-emerald-500/10 border-emerald-500/40"
                    : "bg-emerald-50 border-emerald-300"
                  : isDark
                    ? "bg-rose-500/10 border-rose-500/40"
                    : "bg-rose-50 border-rose-300"
                : ""
            }`}
          >
            <span
              className="text-8xl font-black transition-all duration-75"
              style={{ color: current.displayColor }}
            >
              {current.displayShape}
            </span>
            {answered && (
              <div
                className={`flex items-center gap-2 mt-2 font-bold text-sm ${wasCorrect ? "text-emerald-500" : "text-rose-500"}`}
              >
                {wasCorrect ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <XCircle className="w-5 h-5" />
                )}
                {wasCorrect
                  ? "Correct!"
                  : `Wrong — ${current.isMatch ? "It WAS a match" : "It was NOT a match"}`}
              </div>
            )}
          </div>

          {/* YES / NO buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => handleAnswer(true)}
              disabled={answered}
              className={`py-5 rounded-2xl font-black text-xl transition-all ${
                answered
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:scale-[0.98] active:scale-95"
              } bg-emerald-500 text-white shadow-lg shadow-emerald-500/30`}
            >
              ✓ YES
            </button>
            <button
              onClick={() => handleAnswer(false)}
              disabled={answered}
              className={`py-5 rounded-2xl font-black text-xl transition-all ${
                answered
                  ? "opacity-40 cursor-not-allowed"
                  : "hover:scale-[0.98] active:scale-95"
              } bg-rose-500 text-white shadow-lg shadow-rose-500/30`}
            >
              ✗ NO
            </button>
          </div>
        </div>
      )}

      {/* SCORING */}
      {phase === "scoring" && (
        <div
          className={`${card} rounded-2xl p-12 flex flex-col items-center gap-4`}
        >
          <Puzzle className="w-10 h-10 text-purple-500 animate-pulse" />
          <p className={`font-bold ${text}`}>Calculating your score…</p>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && result && (
        <div className="space-y-4">
          <div className={`${card} rounded-2xl p-6 text-center space-y-3`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Pattern Matching Score
            </p>
            <div className={`text-6xl font-black ${scoreColor(result.score)}`}>
              {result.score}
              <span className="text-2xl text-slate-400">/100</span>
            </div>
            <p className={`text-sm font-semibold ${text}`}>
              {result.interpretation}
            </p>
            <p className={`text-xs ${sub}`}>
              {saved ? "✓ Score saved to your profile" : "Saving…"}
            </p>
          </div>

          <div className={`${card} rounded-2xl p-5`}>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div
                className={`p-4 rounded-xl text-center ${isDark ? "bg-indigo-500/10 border border-indigo-500/20" : "bg-indigo-50 border border-indigo-200"}`}
              >
                <div className="text-3xl font-black text-indigo-500">
                  {result.accuracy_pct}%
                </div>
                <div className={`text-xs font-bold mt-1 ${sub}`}>Accuracy</div>
                <div className={`text-xs mt-0.5 ${sub}`}>
                  {result.correct}/{result.total} correct
                </div>
              </div>
              <div
                className={`p-4 rounded-xl text-center ${isDark ? "bg-purple-500/10 border border-purple-500/20" : "bg-purple-50 border border-purple-200"}`}
              >
                <div className="text-3xl font-black text-purple-500">
                  {result.avg_response_ms}ms
                </div>
                <div className={`text-xs font-bold mt-1 ${sub}`}>
                  Avg Response
                </div>
                <div className={`text-xs mt-0.5 ${sub}`}>
                  Speed Score: {result.speed_score}/100
                </div>
              </div>
            </div>

            {/* Score breakdown bars */}
            <div className="space-y-3">
              {[
                {
                  label: "Accuracy Score",
                  val: result.accuracy_score,
                  color: "bg-indigo-500",
                  weight: "60%",
                },
                {
                  label: "Speed Score",
                  val: result.speed_score,
                  color: "bg-purple-500",
                  weight: "40%",
                },
              ].map(({ label, val, color, weight }) => (
                <div key={label}>
                  <div className="flex justify-between mb-1">
                    <span className={`text-xs font-bold ${sub}`}>{label}</span>
                    <span className={`text-xs font-black ${scoreColor(val)}`}>
                      {val}/100{" "}
                      <span className={`font-normal ${sub}`}>(×{weight})</span>
                    </span>
                  </div>
                  <div
                    className={`w-full h-2 rounded-full ${isDark ? "bg-[#2d3449]" : "bg-slate-200"}`}
                  >
                    <div
                      className={`h-full rounded-full ${color}`}
                      style={{ width: `${val}%`, transition: "width 1s ease" }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={startTest}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-purple-600 text-white hover:bg-purple-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default PatternMatchTest;
