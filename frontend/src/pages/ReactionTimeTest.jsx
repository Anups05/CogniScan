import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { Zap, RotateCcw, CheckCircle2, Loader2 } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOTAL_ROUNDS = 8;
const MIN_WAIT_MS = 1200;
const MAX_WAIT_MS = 3500;

const COLORS = [
  {
    name: "Red",
    bg: "bg-rose-500",
    border: "border-rose-400",
    text: "text-rose-500",
    active: "bg-rose-500",
  },
  {
    name: "Green",
    bg: "bg-emerald-500",
    border: "border-emerald-400",
    text: "text-emerald-500",
    active: "bg-emerald-500",
  },
  {
    name: "Blue",
    bg: "bg-blue-500",
    border: "border-blue-400",
    text: "text-blue-500",
    active: "bg-blue-500",
  },
  {
    name: "Yellow",
    bg: "bg-yellow-400",
    border: "border-yellow-300",
    text: "text-yellow-500",
    active: "bg-yellow-400",
  },
];

// phase: intro | waiting | active | too_early | done | scoring | result
const ReactionTimeTest = () => {
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  const [phase, setPhase] = useState("intro");
  const [round, setRound] = useState(0);
  const [color, setColor] = useState(null);
  const [times, setTimes] = useState([]);
  const [tooEarly, setTooEarly] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const startTimeRef = useRef(null);
  const waitTimerRef = useRef(null);
  const countRef = useRef(null);

  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";
  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  // ── Start countdown, then first round ─────────────────────────────────────
  const startGame = useCallback(() => {
    setTimes([]);
    setRound(0);
    setColor(null);
    setTooEarly(false);
    setResult(null);
    setSaved(false);
    setCountdown(3);
    setPhase("countdown");
    let c = 3;
    countRef.current = setInterval(() => {
      c -= 1;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(countRef.current);
        startRound();
      }
    }, 1000);
  }, []);

  const startRound = useCallback(() => {
    setPhase("waiting");
    setColor(null);
    setTooEarly(false);
    const delay = MIN_WAIT_MS + Math.random() * (MAX_WAIT_MS - MIN_WAIT_MS);
    waitTimerRef.current = setTimeout(() => {
      const c = COLORS[Math.floor(Math.random() * COLORS.length)];
      setColor(c);
      startTimeRef.current = Date.now();
      setPhase("active");
    }, delay);
  }, []);

  // ── Handle tap ─────────────────────────────────────────────────────────────
  const handleTap = useCallback(async () => {
    if (phase === "waiting") {
      clearTimeout(waitTimerRef.current);
      setTooEarly(true);
      setPhase("too_early");
      setTimeout(() => startRound(), 1500);
      return;
    }
    if (phase !== "active") return;
    const elapsed = Date.now() - startTimeRef.current;
    const newTimes = [...times, elapsed];
    setTimes(newTimes);
    const nextRound = round + 1;
    setRound(nextRound);

    if (nextRound >= TOTAL_ROUNDS) {
      setPhase("scoring");
      try {
        const r = await fetch(`${API}/api/cognitive/reaction-time/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ reaction_times_ms: newTimes }),
        });
        const d = await r.json();
        setResult(d);
        setPhase("result");
        saveScore(d.score, d, newTimes);
      } catch {
        setPhase("result");
      }
    } else {
      setColor(null);
      startRound();
    }
  }, [phase, times, round, startRound]);

  const saveScore = async (score, meta, rawTimes) => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(
          db,
          "cognitive_scores",
          user.uid,
          "tests",
          `reaction_${Date.now()}`,
        ),
        {
          testType: "reaction_time",
          score,
          createdAt: serverTimestamp(),
          metadata: {
            avgMs: meta.avg_ms,
            stdevMs: meta.stdev_ms,
            trials: meta.trials,
            rawTimes,
          },
        },
      );
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(
    () => () => {
      clearTimeout(waitTimerRef.current);
      clearInterval(countRef.current);
    },
    [],
  );

  const scoreColor = (s) =>
    s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
          ⚡ Reaction Time Test
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Tap as fast as you can when the screen changes colour. {TOTAL_ROUNDS}{" "}
          rounds total.
        </p>
      </div>

      {/* INTRO */}
      {phase === "intro" && (
        <div className={`${card} rounded-2xl p-8 space-y-5 text-center`}>
          <div className="w-20 h-20 rounded-2xl bg-amber-100 dark:bg-amber-500/20 mx-auto flex items-center justify-center">
            <Zap className="w-10 h-10 text-amber-500" />
          </div>
          <div>
            <p className={`font-bold text-lg ${text}`}>How it works</p>
            <p className={`text-sm mt-2 ${sub}`}>
              The screen will show a grey waiting area. <strong>Wait</strong> —
              when a colour appears, tap the big circle{" "}
              <strong>as fast as you can</strong>. Tapping too early resets the
              round.
            </p>
          </div>
          <div className={`grid grid-cols-4 gap-2`}>
            {COLORS.map((c) => (
              <div
                key={c.name}
                className={`h-10 rounded-xl ${c.bg} flex items-center justify-center text-white text-xs font-bold`}
              >
                {c.name}
              </div>
            ))}
          </div>
          <button
            onClick={startGame}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all"
          >
            Start Test — {TOTAL_ROUNDS} Rounds
          </button>
        </div>
      )}

      {/* COUNTDOWN */}
      {phase === "countdown" && (
        <div className={`${card} rounded-2xl p-12 text-center space-y-4`}>
          <p className={`text-6xl font-black ${text}`}>{countdown}</p>
          <p className={`text-sm ${sub}`}>Get ready…</p>
        </div>
      )}

      {/* WAITING / ACTIVE tap zone */}
      {(phase === "waiting" || phase === "active" || phase === "too_early") && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <p className={`text-sm font-bold ${sub}`}>
              Round {round + 1} of {TOTAL_ROUNDS}
            </p>
            <div className="flex gap-1">
              {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${i < round ? "bg-emerald-500" : isDark ? "bg-[#2d3449]" : "bg-slate-200"}`}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleTap}
            className={`w-full h-80 rounded-3xl font-black text-3xl transition-all duration-75 shadow-lg ${
              phase === "too_early"
                ? "bg-rose-500 text-white"
                : phase === "active" && color
                  ? `${color.bg} text-white scale-[1.02] shadow-[0_0_40px_rgba(0,0,0,0.2)] shadow-${color.name.toLowerCase()}-500/50`
                  : isDark
                    ? "bg-[#1a2440] text-slate-500 border border-[#2d3449]"
                    : "bg-slate-100 text-slate-400 border border-slate-200"
            }`}
          >
            {phase === "too_early"
              ? "⚠️ TOO EARLY"
              : phase === "active" && color
                ? "TAP!"
                : "WAIT..."}
          </button>
          <p className={`text-center text-xs ${sub}`}>
            {phase === "waiting"
              ? "Keep your finger ready…"
              : phase === "active"
                ? "TAP NOW!"
                : ""}
          </p>
        </div>
      )}

      {/* SCORING */}
      {phase === "scoring" && (
        <div
          className={`${card} rounded-2xl p-12 flex flex-col items-center gap-4`}
        >
          <Zap className="w-8 h-8 text-amber-500 animate-pulse" />
          <p className={`font-bold ${text}`}>Calculating your reaction time…</p>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && result && (
        <div className="space-y-4">
          <div className={`${card} rounded-2xl p-6 text-center space-y-3`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Reaction Time Score
            </p>
            <div
              className={`text-6xl font-black tabular-nums ${scoreColor(result.score)}`}
            >
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
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Avg Response", value: `${result.avg_ms}ms` },
                { label: "Consistency (σ)", value: `${result.stdev_ms}ms` },
                { label: "Rounds", value: result.trials },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className={`p-3 rounded-xl text-center ${isDark ? "bg-[#0f1726] border border-[#2d3449]" : "bg-slate-50 border border-slate-200"}`}
                >
                  <div className={`text-lg font-black ${text}`}>{value}</div>
                  <div className={`text-xs font-bold mt-0.5 ${sub}`}>
                    {label}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <p
                className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}
              >
                Individual Round Times
              </p>
              <div className="flex flex-wrap gap-2">
                {times.map((t, i) => (
                  <span
                    key={i}
                    className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      t <= 300
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                        : t <= 500
                          ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                    }`}
                  >
                    {t}ms
                  </span>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={startGame}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-amber-500 text-white hover:bg-amber-600 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ReactionTimeTest;
