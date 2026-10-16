import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { MessageSquare, Loader2, RotateCcw, XCircle, Mic } from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TIME_LIMIT = 30;

const WordFluencyTest = () => {
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  // phase: loading | intro | countdown | active | scoring | result | error
  const [phase, setPhase] = useState("loading");
  const [prompt, setPrompt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(TIME_LIMIT);
  const [words, setWords] = useState([]);
  const [inputVal, setInputVal] = useState("");
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);
  const [cdCount, setCdCount] = useState(3);

  const timerRef = useRef(null);
  const cdRef = useRef(null);
  const inputRef = useRef(null);

  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";
  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  // ── Fetch prompt from backend ──────────────────────────────────────────────
  const fetchPrompt = useCallback(async () => {
    setPhase("loading");
    setWords([]);
    setInputVal("");
    setResult(null);
    setSaved(false);
    setTimeLeft(TIME_LIMIT);
    try {
      const r = await fetch(`${API}/api/cognitive/word-fluency/prompt`);
      const d = await r.json();
      setPrompt(d);
      setPhase("intro");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    fetchPrompt();
  }, [fetchPrompt]);
  useEffect(
    () => () => {
      clearInterval(timerRef.current);
      clearInterval(cdRef.current);
    },
    [],
  );

  // ── Start countdown then test ──────────────────────────────────────────────
  const startCountdown = () => {
    setCdCount(3);
    setPhase("countdown");
    let c = 3;
    cdRef.current = setInterval(() => {
      c -= 1;
      setCdCount(c);
      if (c <= 0) {
        clearInterval(cdRef.current);
        beginTest();
      }
    }, 1000);
  };

  const beginTest = () => {
    setPhase("active");
    setTimeLeft(TIME_LIMIT);
    let t = TIME_LIMIT;
    timerRef.current = setInterval(() => {
      t -= 1;
      setTimeLeft(t);
      if (t <= 0) {
        clearInterval(timerRef.current);
        submitWords();
      }
    }, 1000);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ── Add a word ─────────────────────────────────────────────────────────────
  const addWord = useCallback(() => {
    const w = inputVal
      .trim()
      .toLowerCase()
      .replace(/[^a-z]/g, "");
    if (w && !words.includes(w)) setWords((p) => [...p, w]);
    setInputVal("");
  }, [inputVal, words]);

  const removeWord = (w) => setWords((p) => p.filter((x) => x !== w));

  // ── Submit on timer end or manual ─────────────────────────────────────────
  const submitWords = useCallback(
    async (manualWords) => {
      clearInterval(timerRef.current);
      const finalWords = manualWords ?? words;
      if (!prompt) return;
      setPhase("scoring");
      try {
        const r = await fetch(`${API}/api/cognitive/word-fluency/score`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            words: finalWords,
            category: prompt.category,
            time_limit_sec: TIME_LIMIT,
          }),
        });
        const d = await r.json();
        setResult(d);
        setPhase("result");
        saveScore(d.score, d);
      } catch {
        setPhase("error");
      }
    },
    [words, prompt],
  );

  const handleManualSubmit = () => submitWords(words);

  const saveScore = async (score, meta) => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(db, "cognitive_scores", user.uid, "tests", `fluency_${Date.now()}`),
        {
          testType: "word_fluency",
          score,
          createdAt: serverTimestamp(),
          metadata: {
            category: meta.category,
            wordCount: meta.word_count,
            ratePerMin: meta.rate_per_min,
            words: meta.unique_words,
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
  const timerColor =
    timeLeft <= 10
      ? "text-rose-500"
      : timeLeft <= 20
        ? "text-amber-500"
        : "text-indigo-500";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
          🔤 Word Fluency Test
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Say (type) as many words as possible in {TIME_LIMIT} seconds.
        </p>
      </div>

      {/* LOADING */}
      {phase === "loading" && (
        <div
          className={`${card} rounded-2xl p-12 flex flex-col items-center gap-4`}
        >
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className={`font-bold ${text}`}>Loading your test…</p>
        </div>
      )}

      {/* INTRO */}
      {phase === "intro" && prompt && (
        <div className={`${card} rounded-2xl p-8 space-y-6 text-center`}>
          <div className="w-20 h-20 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 mx-auto flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-emerald-500" />
          </div>
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}
            >
              Your challenge
            </p>
            <p className={`font-bold text-xl ${text}`}>{prompt.instruction}</p>
            <p className={`text-sm mt-2 ${sub}`}>
              You have{" "}
              <span className="font-black text-indigo-500">
                {TIME_LIMIT} seconds
              </span>
              . Type one word, press Enter to add it. No repeats allowed.
            </p>
          </div>
          <button
            onClick={startCountdown}
            className="w-full py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600 transition-all"
          >
            Start {TIME_LIMIT}-Second Challenge
          </button>
        </div>
      )}

      {/* COUNTDOWN */}
      {phase === "countdown" && (
        <div className={`${card} rounded-2xl p-12 text-center space-y-3`}>
          <p className={`text-7xl font-black ${text}`}>{cdCount}</p>
          <p className={`text-sm ${sub}`}>
            Get ready — think of words starting with{" "}
            <span className="font-black text-indigo-500">
              "{prompt?.category}"
            </span>
          </p>
        </div>
      )}

      {/* ACTIVE */}
      {phase === "active" && prompt && (
        <div className="space-y-4">
          {/* Timer bar */}
          <div className={`${card} rounded-2xl p-4 flex items-center gap-4`}>
            <div
              className={`text-3xl font-black tabular-nums min-w-[3rem] ${timerColor}`}
            >
              {timeLeft}s
            </div>
            <div className="flex-1">
              <div
                className={`w-full h-3 rounded-full ${isDark ? "bg-[#2d3449]" : "bg-slate-200"}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${timeLeft <= 10 ? "bg-rose-500" : timeLeft <= 20 ? "bg-amber-500" : "bg-indigo-500"}`}
                  style={{ width: `${(timeLeft / TIME_LIMIT) * 100}%` }}
                />
              </div>
            </div>
            <span className={`text-sm font-bold ${text}`}>
              {words.length} words
            </span>
          </div>

          {/* Prompt reminder */}
          <div
            className={`p-3 rounded-xl border-l-4 border-emerald-500 ${isDark ? "bg-emerald-500/10" : "bg-emerald-50"}`}
          >
            <p
              className={`font-bold text-sm ${isDark ? "text-emerald-300" : "text-emerald-700"}`}
            >
              {prompt.instruction}
            </p>
          </div>

          {/* Input */}
          <div className="flex gap-2">
            <input
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addWord()}
              placeholder="Type a word and press Enter…"
              className={`flex-1 px-4 py-3 rounded-xl border font-semibold text-sm outline-none focus:ring-2 focus:ring-emerald-500 ${
                isDark
                  ? "bg-[#0f1726] border-[#2d3449] text-white placeholder-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            <button
              onClick={addWord}
              className="px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm"
            >
              Add
            </button>
          </div>

          {/* Word chips */}
          <div className="min-h-[80px] flex flex-wrap gap-2 content-start">
            {words.map((w, i) => (
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

          <button
            onClick={handleManualSubmit}
            className="w-full py-3 rounded-xl font-bold text-sm bg-slate-700 dark:bg-slate-600 text-white hover:bg-slate-800 transition-all"
          >
            Done — Submit Early
          </button>
        </div>
      )}

      {/* SCORING */}
      {phase === "scoring" && (
        <div
          className={`${card} rounded-2xl p-12 flex flex-col items-center gap-4`}
        >
          <MessageSquare className="w-10 h-10 text-emerald-500 animate-pulse" />
          <p className={`font-bold ${text}`}>Scoring your words…</p>
        </div>
      )}

      {/* RESULT */}
      {phase === "result" && result && (
        <div className="space-y-4">
          <div className={`${card} rounded-2xl p-6 text-center space-y-3`}>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Word Fluency Score
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

          <div className={`${card} rounded-2xl p-5 space-y-4`}>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Words Entered", value: result.word_count },
                { label: "Rate / min", value: `${result.rate_per_min}` },
                { label: "Category", value: result.category },
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
            {result.unique_words?.length > 0 && (
              <div>
                <p
                  className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}
                >
                  Your words:
                </p>
                <div className="flex flex-wrap gap-2">
                  {result.unique_words.map((w, i) => (
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
            onClick={fetchPrompt}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-emerald-600 text-white hover:bg-emerald-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> New Category — Try Again
          </button>
        </div>
      )}

      {/* ERROR */}
      {phase === "error" && (
        <div className={`${card} rounded-2xl p-10 text-center space-y-4`}>
          <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <p className={`font-bold ${text}`}>Connection error.</p>
          <button
            onClick={fetchPrompt}
            className="px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-bold"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default WordFluencyTest;
