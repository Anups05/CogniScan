import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Brain,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Loader2,
  ArrowRight,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const MEMORISE_SEC = 8; // how long words are shown
const DELAY_SEC = 5; // blank delay before recall

const MemoryRecallTest = () => {
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  // phase: loading | memorise | delay | recall | scoring | result | error
  const [phase, setPhase] = useState("loading");
  const [words, setWords] = useState([]);
  const [countdown, setCountdown] = useState(MEMORISE_SEC);
  const [inputVal, setInputVal] = useState("");
  const [recalled, setRecalled] = useState([]);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const timerRef = useRef(null);

  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";
  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  // ── Fetch words from backend ───────────────────────────────────────────────
  const startTest = useCallback(async () => {
    setPhase("loading");
    setResult(null);
    setRecalled([]);
    setInputVal("");
    setSaved(false);
    try {
      const r = await fetch(`${API}/api/cognitive/memory-recall/generate`);
      const d = await r.json();
      setWords(d.words);
      setCountdown(MEMORISE_SEC);
      setPhase("memorise");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    startTest();
  }, [startTest]);

  // ── Countdown during memorise & delay ─────────────────────────────────────
  useEffect(() => {
    if (phase !== "memorise" && phase !== "delay") return;
    const duration = phase === "memorise" ? MEMORISE_SEC : DELAY_SEC;
    setCountdown(duration);
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(timerRef.current);
          setPhase((p) => (p === "memorise" ? "delay" : "recall"));
          return 0;
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [phase]);

  // ── Add a recalled word ────────────────────────────────────────────────────
  const addWord = () => {
    const w = inputVal.trim();
    if (w && !recalled.includes(w.toLowerCase())) {
      setRecalled((p) => [...p, w.toLowerCase()]);
    }
    setInputVal("");
  };

  const removeWord = (w) => setRecalled((p) => p.filter((x) => x !== w));

  // ── Submit recall ──────────────────────────────────────────────────────────
  const submitRecall = async () => {
    setPhase("scoring");
    try {
      const r = await fetch(`${API}/api/cognitive/memory-recall/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original_words: words,
          recalled_words: recalled,
        }),
      });
      const d = await r.json();
      setResult(d);
      setPhase("result");
      saveScore(d.score, d);
    } catch {
      setPhase("error");
    }
  };

  // ── Save to Firestore ──────────────────────────────────────────────────────
  const saveScore = async (score, meta) => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(db, "cognitive_scores", user.uid, "tests", `memory_${Date.now()}`),
        {
          testType: "memory_recall",
          score,
          createdAt: serverTimestamp(),
          metadata: {
            originalWords: words,
            recalledWords: recalled,
            exactCorrect: meta.exact_correct,
            totalWords: meta.total_words,
            missedWords: meta.missed_words,
          },
        },
      );
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  // ── Score colour ───────────────────────────────────────────────────────────
  const scoreColor = (s) =>
    s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-rose-500";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
          🧠 Memory Recall Test
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Memorise the words, then recall them after a short delay.
        </p>
      </div>

      {/* LOADING */}
      {phase === "loading" && (
        <div
          className={`${card} rounded-2xl p-12 flex flex-col items-center gap-4`}
        >
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className={`font-bold ${text}`}>Loading your memory test…</p>
        </div>
      )}

      {/* ERROR */}
      {phase === "error" && (
        <div className={`${card} rounded-2xl p-10 text-center space-y-4`}>
          <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className={`font-bold ${text}`}>
            Could not connect to the backend.
          </p>
          <button
            onClick={startTest}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Retry
          </button>
        </div>
      )}

      {/* MEMORISE */}
      {phase === "memorise" && (
        <div className={`${card} rounded-2xl p-8 text-center space-y-6`}>
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${isDark ? "bg-amber-500/20 text-amber-400" : "bg-amber-100 text-amber-700"} font-bold text-sm`}
          >
            👁️ Memorise! — {countdown}s remaining
          </div>
          <p className={`text-sm ${sub}`}>
            Study these words carefully. They will disappear in {countdown}{" "}
            seconds.
          </p>
          <div className="grid grid-cols-3 gap-3">
            {words.map((w, i) => (
              <div
                key={i}
                className={`p-4 rounded-xl font-bold text-lg text-center ${isDark ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30" : "bg-indigo-50 text-indigo-700 border border-indigo-200"}`}
              >
                {w}
              </div>
            ))}
          </div>
          {/* Progress bar */}
          <div
            className={`w-full h-2 rounded-full ${isDark ? "bg-[#2d3449]" : "bg-slate-200"}`}
          >
            <div
              className="h-full rounded-full bg-amber-500 transition-all duration-1000"
              style={{ width: `${(countdown / MEMORISE_SEC) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* DELAY */}
      {phase === "delay" && (
        <div className={`${card} rounded-2xl p-12 text-center space-y-4`}>
          <div
            className={`text-5xl font-black ${isDark ? "text-slate-600" : "text-slate-300"}`}
          >
            {countdown}s
          </div>
          <p className={`font-bold text-lg ${text}`}>
            Words hidden — get ready to recall!
          </p>
          <p className={`text-sm ${sub}`}>
            The recall phase starts in {countdown} second
            {countdown !== 1 ? "s" : ""}.
          </p>
        </div>
      )}

      {/* RECALL */}
      {phase === "recall" && (
        <div className={`${card} rounded-2xl p-6 space-y-5`}>
          <div
            className={`p-4 rounded-xl ${isDark ? "bg-indigo-500/10 border border-indigo-500/30" : "bg-indigo-50 border border-indigo-200"}`}
          >
            <p
              className={`font-bold text-sm ${isDark ? "text-indigo-300" : "text-indigo-700"}`}
            >
              📝 Type every word you remember and press Enter or Add.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              autoFocus
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWord()}
              placeholder="Type a word…"
              className={`flex-1 px-4 py-3 rounded-xl border font-semibold text-sm outline-none focus:ring-2 focus:ring-indigo-500 ${
                isDark
                  ? "bg-[#0f1726] border-[#2d3449] text-white placeholder-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            <button
              onClick={addWord}
              className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm transition-colors"
            >
              Add
            </button>
          </div>

          {/* Recalled words chips */}
          {recalled.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {recalled.map((w, i) => (
                <span
                  key={i}
                  onClick={() => removeWord(w)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all ${
                    isDark
                      ? "bg-emerald-500/20 text-emerald-400 hover:bg-rose-500/20 hover:text-rose-400"
                      : "bg-emerald-100 text-emerald-700 hover:bg-rose-100 hover:text-rose-600"
                  }`}
                >
                  {w} <XCircle className="w-3.5 h-3.5" />
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className={`text-sm ${sub}`}>
              {recalled.length} word{recalled.length !== 1 ? "s" : ""} entered
            </p>
            <button
              onClick={submitRecall}
              disabled={recalled.length === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm disabled:opacity-40 hover:from-indigo-700 hover:to-purple-700 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Recall
            </button>
          </div>
        </div>
      )}

      {/* SCORING */}
      {phase === "scoring" && (
        <div
          className={`${card} rounded-2xl p-12 flex flex-col items-center gap-4`}
        >
          <Brain className="w-10 h-10 text-indigo-500 animate-pulse" />
          <p className={`font-bold ${text}`}>Scoring your recall…</p>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && result && (
        <div className="space-y-4">
          {/* Score hero */}
          <div className={`${card} rounded-2xl p-6 text-center space-y-3`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Memory Recall Score
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

          {/* Word breakdown */}
          <div className={`${card} rounded-2xl p-5 space-y-4`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Word Breakdown
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-3 rounded-xl text-center ${isDark ? "bg-emerald-500/10 border border-emerald-500/20" : "bg-emerald-50 border border-emerald-200"}`}
              >
                <div className="text-2xl font-black text-emerald-500">
                  {result.exact_correct}
                </div>
                <div
                  className={`text-xs font-bold mt-1 ${isDark ? "text-emerald-400" : "text-emerald-700"}`}
                >
                  Correctly Recalled
                </div>
              </div>
              <div
                className={`p-3 rounded-xl text-center ${isDark ? "bg-rose-500/10 border border-rose-500/20" : "bg-rose-50 border border-rose-200"}`}
              >
                <div className="text-2xl font-black text-rose-500">
                  {result.missed_words?.length || 0}
                </div>
                <div
                  className={`text-xs font-bold mt-1 ${isDark ? "text-rose-400" : "text-rose-700"}`}
                >
                  Words Forgotten
                </div>
              </div>
            </div>

            {result.missed_words?.length > 0 && (
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}
                >
                  Words you missed:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.missed_words.map((w, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-400"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {result.correct_words?.length > 0 && (
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}
                >
                  Words you got right:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.correct_words.map((w, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400"
                    >
                      {w}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={startTest}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Try Again with New Words
          </button>
        </div>
      )}
    </div>
  );
};

export default MemoryRecallTest;
