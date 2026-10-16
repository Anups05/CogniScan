// DualTaskTest.jsx
import React, { useState, useEffect } from "react";
import { ArrowLeft, Clock, Activity, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const COLORS = [
  { name: "Red", cls: "bg-red-500", ring: "ring-red-400" },
  { name: "Blue", cls: "bg-blue-500", ring: "ring-blue-400" },
  { name: "Green", cls: "bg-emerald-500", ring: "ring-emerald-400" },
  { name: "Purple", cls: "bg-purple-500", ring: "ring-purple-400" },
];
const WORDS = [
  "APPLE",
  "HOUSE",
  "TRAIN",
  "WATER",
  "CLOCK",
  "BRAIN",
  "TIGER",
  "OCEAN",
];

const DualTaskTest = () => {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentWord, setCurrentWord] = useState("APPLE");
  const [typedWord, setTypedWord] = useState("");
  const [targetColorIdx, setTargetColorIdx] = useState(0);

  const nextTarget = () => {
    setCurrentWord(WORDS[Math.floor(Math.random() * WORDS.length)]);
    setTargetColorIdx(Math.floor(Math.random() * COLORS.length));
    setTypedWord("");
  };

  const startGame = () => {
    setScore(0);
    setTimeLeft(60);
    nextTarget();
    setIsPlaying(true);
  };

  useEffect(() => {
    let t;
    if (isPlaying && timeLeft > 0)
      t = setInterval(() => setTimeLeft((p) => p - 1), 1000);
    else if (timeLeft === 0) setIsPlaying(false);
    return () => clearInterval(t);
  }, [isPlaying, timeLeft]);

  useEffect(() => {
    if (isPlaying && typedWord.toUpperCase() === currentWord) {
      setScore((p) => p + 10);
      nextTarget();
    }
  }, [typedWord]);

  const handleColorClick = (idx) => {
    if (!isPlaying) return;
    if (idx === targetColorIdx) {
      setScore((p) => p + 5);
      setTargetColorIdx(Math.floor(Math.random() * COLORS.length));
    } else {
      setScore((p) => Math.max(0, p - 2));
    }
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/app/cognitive")}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Dual-Task Test
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Type the word AND click the matching color
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-6 shadow-sm">
        {/* Score + Timer */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-extrabold text-xl">
            <Activity className="w-5 h-5" /> {score}
          </div>
          <div
            className={`flex items-center gap-2 font-extrabold text-xl ${timeLeft <= 10 ? "text-rose-500 animate-pulse" : "text-slate-500 dark:text-slate-400"}`}
          >
            <Clock className="w-5 h-5" /> {timeLeft}s
          </div>
        </div>

        {!isPlaying && timeLeft === 60 && (
          <div className="text-center py-8 space-y-5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              How to play
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              Simultaneously type the word shown AND click the matching colored
              square at the bottom.
            </p>
            <button
              onClick={startGame}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              Start Test
            </button>
          </div>
        )}

        {!isPlaying && timeLeft === 0 && (
          <div className="text-center py-8 space-y-4">
            <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto" />
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
              Test Complete!
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              You scored <strong>{score}</strong> points.
            </p>
            <button
              onClick={() => navigate("/app/cognitive")}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-sm"
            >
              Return to Tests
            </button>
          </div>
        )}

        {isPlaying && (
          <div className="space-y-10">
            {/* Word task */}
            <div className="text-center">
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">
                Type this word:
              </p>
              <h2 className="text-5xl font-black text-slate-900 dark:text-white tracking-widest mb-5">
                {currentWord}
              </h2>
              <input
                autoFocus
                type="text"
                value={typedWord}
                onChange={(e) => setTypedWord(e.target.value)}
                className="w-full max-w-xs text-center text-2xl font-bold px-4 py-3 bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 outline-none text-slate-900 dark:text-white uppercase tracking-widest transition-colors"
                placeholder="..."
              />
            </div>

            {/* Color task */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-4 text-center">
                Click this color:
              </p>
              <div className="flex justify-center mb-6">
                <div
                  className={`w-16 h-16 rounded-2xl ${COLORS[targetColorIdx].cls} shadow-lg`}
                />
              </div>
              <div className="grid grid-cols-4 gap-3">
                {COLORS.map((color, idx) => (
                  <button
                    key={color.name}
                    onClick={() => handleColorClick(idx)}
                    className={`h-16 rounded-2xl ${color.cls} shadow-md hover:scale-105 active:scale-95 transition-transform`}
                    aria-label={color.name}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DualTaskTest;
