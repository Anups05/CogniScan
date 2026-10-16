import React, { useState, useEffect, useRef, useCallback } from "react";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Hash,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:8000";
const TOTAL_ROUNDS = 5;

const NumberSequenceTest = () => {
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  // phase: loading | question | answering | result | done
  const [phase, setPhase] = useState("loading");
  const [question, setQuestion] = useState(null);
  const [round, setRound] = useState(1);
  const [userAnswer, setUserAnswer] = useState("");
  const [roundResults, setRoundResults] = useState([]);
  const [startTime, setStartTime] = useState(null);
  const [lastResult, setLastResult] = useState(null);
  const [finalResult, setFinalResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";
  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  // ── Fetch a question ───────────────────────────────────────────────────────
  const fetchQuestion = useCallback(async () => {
    setPhase("loading");
    setUserAnswer("");
    setLastResult(null);
    try {
      const r = await fetch(`${API}/api/cognitive/number-sequence/generate`);
      const d = await r.json();
      setQuestion(d);
      setStartTime(Date.now());
      setPhase("answering");
    } catch {
      setPhase("error");
    }
  }, []);

  useEffect(() => {
    fetchQuestion();
  }, [fetchQuestion]);

  // ── Submit an answer ───────────────────────────────────────────────────────
  const submitAnswer = useCallback(async () => {
    if (!userAnswer.trim() || !question) return;
    const timeTaken = (Date.now() - startTime) / 1000;
    const ans = parseInt(userAnswer.trim(), 10);
    if (isNaN(ans)) return;

    try {
      const r = await fetch(`${API}/api/cognitive/number-sequence/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correct_answer: question.answer,
          user_answer: ans,
          time_taken_sec: timeTaken,
        }),
      });
      const d = await r.json();
      const newResults = [
        ...roundResults,
        { ...d, round, sequence: question.sequence, rule: question.rule },
      ];
      setRoundResults(newResults);
      setLastResult(d);
      setPhase("roundResult");

      if (round >= TOTAL_ROUNDS) {
        // Calculate overall score: average of all rounds
        const avgScore =
          newResults.reduce((s, r) => s + r.score, 0) / newResults.length;
        const finalData = {
          overall_score: Math.round(avgScore * 10) / 10,
          rounds: newResults,
        };
        setFinalResult(finalData);
        saveScore(Math.round(avgScore * 10) / 10, finalData);
      }
    } catch {}
  }, [userAnswer, question, startTime, roundResults, round]);

  const saveScore = async (score, meta) => {
    if (!user?.uid) return;
    try {
      await setDoc(
        doc(
          db,
          "cognitive_scores",
          user.uid,
          "tests",
          `sequence_${Date.now()}`,
        ),
        {
          testType: "number_sequence",
          score,
          createdAt: serverTimestamp(),
          metadata: {
            totalRounds: TOTAL_ROUNDS,
            rounds: meta.rounds.map((r) => ({
              correct: r.correct,
              score: r.score,
              timeSec: r.time_taken_sec,
            })),
          },
        },
      );
      setSaved(true);
    } catch (e) {
      console.error(e);
    }
  };

  const nextRound = () => {
    if (round >= TOTAL_ROUNDS) {
      setPhase("done");
      return;
    }
    setRound((r) => r + 1);
    fetchQuestion();
  };

  const restart = () => {
    setRound(1);
    setRoundResults([]);
    setFinalResult(null);
    setSaved(false);
    fetchQuestion();
  };

  const scoreColor = (s) =>
    s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-rose-500";

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
          🔢 Number Sequence Test
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Find the next number in the pattern. {TOTAL_ROUNDS} rounds total.
        </p>
      </div>

      {/* Round progress */}
      <div className="flex gap-2">
        {Array.from({ length: TOTAL_ROUNDS }).map((_, i) => (
          <div
            key={i}
            className={`flex-1 h-2 rounded-full transition-all ${
              i < roundResults.length
                ? roundResults[i]?.correct
                  ? "bg-emerald-500"
                  : "bg-rose-500"
                : i === round - 1
                  ? "bg-indigo-500"
                  : isDark
                    ? "bg-[#2d3449]"
                    : "bg-slate-200"
            }`}
          />
        ))}
      </div>

      {/* LOADING */}
      {phase === "loading" && (
        <div
          className={`${card} rounded-2xl p-12 flex flex-col items-center gap-4`}
        >
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <p className={`font-bold ${text}`}>Loading question {round}…</p>
        </div>
      )}

      {/* ANSWERING */}
      {phase === "answering" && question && (
        <div className={`${card} rounded-2xl p-6 space-y-6`}>
          <div
            className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full inline-block ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-100 text-indigo-600"}`}
          >
            Question {round} of {TOTAL_ROUNDS}
          </div>

          <p className={`text-sm font-semibold ${sub}`}>
            What comes next in this sequence?
          </p>

          {/* Sequence display */}
          <div className="flex items-center gap-3 justify-center flex-wrap">
            {question.sequence.map((n, i) => (
              <React.Fragment key={i}>
                <div
                  className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black ${
                    isDark
                      ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                      : "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  }`}
                >
                  {n}
                </div>
                <span className={`text-lg ${sub}`}>→</span>
              </React.Fragment>
            ))}
            {/* Answer box */}
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black border-2 border-dashed ${
                isDark
                  ? "border-indigo-500/50 text-indigo-400"
                  : "border-indigo-400 text-indigo-500"
              }`}
            >
              ?
            </div>
          </div>

          <div className="flex gap-2">
            <input
              autoFocus
              type="number"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitAnswer()}
              placeholder="Your answer…"
              className={`flex-1 px-4 py-3 rounded-xl border font-bold text-lg outline-none focus:ring-2 focus:ring-indigo-500 text-center ${
                isDark
                  ? "bg-[#0f1726] border-[#2d3449] text-white placeholder-slate-500"
                  : "bg-white border-slate-200 text-slate-900 placeholder-slate-400"
              }`}
            />
            <button
              onClick={submitAnswer}
              disabled={!userAnswer.trim()}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm disabled:opacity-40 transition-colors"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* ROUND RESULT */}
      {phase === "roundResult" && lastResult && (
        <div className="space-y-4">
          <div className={`${card} rounded-2xl p-6 text-center space-y-3`}>
            {lastResult.correct ? (
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            ) : (
              <XCircle className="w-12 h-12 text-rose-500 mx-auto" />
            )}
            <p className={`font-bold text-lg ${text}`}>
              {lastResult.correct ? "Correct!" : "Not quite…"}
            </p>
            {!lastResult.correct && (
              <p className={`text-sm ${sub}`}>
                The answer was{" "}
                <span className="font-black text-indigo-500">
                  {lastResult.correct_answer}
                </span>
              </p>
            )}
            <p
              className={`text-xs font-semibold ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Round score:{" "}
              <span className={`font-black ${scoreColor(lastResult.score)}`}>
                {lastResult.score}/100
              </span>
              {" · "}
              {lastResult.time_taken_sec}s
            </p>
            {lastResult.rule && (
              <p
                className={`text-xs px-3 py-1.5 rounded-lg inline-block ${isDark ? "bg-[#0f1726] text-slate-400" : "bg-slate-50 text-slate-500"}`}
              >
                Pattern: {lastResult.rule}
              </p>
            )}
          </div>

          <button
            onClick={nextRound}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            {round >= TOTAL_ROUNDS ? (
              <>
                <CheckCircle2 className="w-4 h-4" /> View Final Score
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4" /> Next Question
              </>
            )}
          </button>
        </div>
      )}

      {/* DONE — final score */}
      {(phase === "done" ||
        (phase === "roundResult" && round >= TOTAL_ROUNDS && finalResult)) &&
        finalResult && (
          <div className="space-y-4">
            <div className={`${card} rounded-2xl p-6 text-center space-y-3`}>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${sub}`}
              >
                Overall Number Sequence Score
              </p>
              <div
                className={`text-6xl font-black ${scoreColor(finalResult.overall_score)}`}
              >
                {finalResult.overall_score}
                <span className="text-2xl text-slate-400">/100</span>
              </div>
              <p className={`text-xs ${sub}`}>
                {saved ? "✓ Score saved to your profile" : "Saving…"}
              </p>
            </div>

            <div className={`${card} rounded-2xl p-5 space-y-2`}>
              <p
                className={`text-xs font-bold uppercase tracking-wider mb-3 ${sub}`}
              >
                Round Breakdown
              </p>
              {roundResults.map((r, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-lg ${isDark ? "hover:bg-[#0f1726]" : "hover:bg-slate-50"} transition-colors`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${r.correct ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"}`}
                  >
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold ${text} truncate`}>
                      {r.rule}
                    </p>
                  </div>
                  <span className={`text-xs font-black ${scoreColor(r.score)}`}>
                    {r.score}/100
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={restart}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              <RotateCcw className="w-4 h-4" /> Try Again
            </button>
          </div>
        )}
    </div>
  );
};

export default NumberSequenceTest;
