import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import {
  Brain,
  Zap,
  Hash,
  MessageSquare,
  Puzzle,
  Clock,
  SplitSquareHorizontal,
  ArrowRight,
  CheckCircle,
  Trophy,
  TrendingUp,
  Loader2,
} from "lucide-react";

// ─── Test catalog ────────────────────────────────────────────────────────────
const TESTS = [
  {
    id: "memory",
    path: "/app/test/memory",
    title: "Memory Recall",
    description:
      "Memorise 5 words shown for 8 seconds, then recall them after a short delay.",
    icon: Brain,
    color: "indigo",
    iconBgDark: "bg-indigo-500/15 text-indigo-400 border-indigo-500/25",
    iconBgLight: "bg-indigo-100  text-indigo-600  border-indigo-200",
    badge: "🧠",
    detects: "Short-term memory",
    difficulty: "Easy",
    duration: "~2 min",
  },
  {
    id: "reaction",
    path: "/app/test/reaction",
    title: "Reaction Time",
    description:
      "Tap the screen as fast as you can when a colour appears. 8 rounds.",
    icon: Zap,
    color: "amber",
    iconBgDark: "bg-amber-500/15 text-amber-400 border-amber-500/25",
    iconBgLight: "bg-amber-100  text-amber-600  border-amber-200",
    badge: "⚡",
    detects: "Processing speed",
    difficulty: "Easy",
    duration: "~1 min",
  },
  {
    id: "sequence",
    path: "/app/test/sequence",
    title: "Number Sequence",
    description:
      "Find the next number in a pattern. 5 rounds. Groq AI generates each sequence.",
    icon: Hash,
    color: "blue",
    iconBgDark: "bg-blue-500/15 text-blue-400 border-blue-500/25",
    iconBgLight: "bg-blue-100  text-blue-600  border-blue-200",
    badge: "🔢",
    detects: "Logical reasoning",
    difficulty: "Medium",
    duration: "~3 min",
  },
  {
    id: "fluency",
    path: "/app/test/fluency",
    title: "Word Fluency",
    description: "Name as many words as possible in a category in 30 seconds.",
    icon: MessageSquare,
    color: "emerald",
    iconBgDark: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
    iconBgLight: "bg-emerald-100  text-emerald-600  border-emerald-200",
    badge: "🔤",
    detects: "Language & retrieval",
    difficulty: "Medium",
    duration: "~1 min",
  },
  {
    id: "pattern",
    path: "/app/test/pattern",
    title: "Pattern Matching",
    description:
      "Does the shape match the target? Tap YES or NO as fast as you can. 12 rounds.",
    icon: Puzzle,
    color: "purple",
    iconBgDark: "bg-purple-500/15 text-purple-400 border-purple-500/25",
    iconBgLight: "bg-purple-100  text-purple-600  border-purple-200",
    badge: "🧩",
    detects: "Visual processing",
    difficulty: "Easy",
    duration: "~2 min",
  },
];

const difficultyColor = (d) =>
  d === "Easy"
    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
    : d === "Medium"
      ? "bg-amber-100   text-amber-700   dark:bg-amber-500/20   dark:text-amber-400"
      : "bg-rose-100    text-rose-700     dark:bg-rose-500/20    dark:text-rose-400";

// ─── Score fetch from Firestore ───────────────────────────────────────────
async function fetchLatestScores(uid) {
  if (!uid) return {};
  const scores = {};
  try {
    for (const test of TESTS) {
      const q = query(
        collection(db, "cognitive_scores", uid, "tests"),
        orderBy("createdAt", "desc"),
        limit(1),
      );
      // We can't filter by testType here without a composite index,
      // so we'll just fetch the most recent per-collection-path.
      // For now return empty - scores populate after first attempt.
    }
  } catch {}
  return scores;
}

// ─── Main Page ────────────────────────────────────────────────────────────
const TestsPage = () => {
  const navigate = useNavigate();
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  const [recentScores, setRecentScores] = useState({});
  const [loading, setLoading] = useState(true);

  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";

  // ── Fetch recent scores from Firestore ────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }
      try {
        const q = query(
          collection(db, "cognitive_scores", user.uid, "tests"),
          orderBy("createdAt", "desc"),
          limit(20),
        );
        const snap = await getDocs(q);
        const byType = {};
        snap.forEach((doc) => {
          const d = doc.data();
          if (!byType[d.testType]) byType[d.testType] = d.score;
        });
        setRecentScores(byType);
      } catch (e) {
        console.error(e);
      }
      setLoading(false);
    };
    load();
  }, [user?.uid]);

  const testTypeMap = {
    memory: "memory_recall",
    reaction: "reaction_time",
    sequence: "number_sequence",
    fluency: "word_fluency",
    pattern: "pattern_matching",
  };

  const getScore = (id) => {
    const key = testTypeMap[id];
    return key ? recentScores[key] : undefined;
  };

  const scoreColor = (s) =>
    s >= 80 ? "text-emerald-500" : s >= 60 ? "text-amber-500" : "text-rose-500";

  const completedCount = TESTS.filter(
    (t) => getScore(t.id) !== undefined,
  ).length;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
            🧪 Cognitive Test Suite
          </h1>
          <p className={`text-sm mt-1 ${sub}`}>
            Select a cognitive test below. Scores are saved automatically to
            your profile.
          </p>
        </div>

        {/* Overall progress */}
        <div
          className={`flex items-center gap-4 px-5 py-3 rounded-2xl ${card} flex-shrink-0`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />
          ) : (
            <Trophy className="w-5 h-5 text-amber-500" />
          )}
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Progress
            </p>
            <p className={`text-sm font-black ${text}`}>
              {completedCount} / {TESTS.length} completed
            </p>
          </div>
          {/* Mini progress dots */}
          <div className="flex gap-1">
            {TESTS.map((t) => (
              <div
                key={t.id}
                className={`w-2.5 h-2.5 rounded-full ${
                  getScore(t.id) !== undefined
                    ? "bg-emerald-500"
                    : isDark
                      ? "bg-[#2d3449]"
                      : "bg-slate-200"
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Score summary bar (if any scores) */}
      {!loading && completedCount > 0 && (
        <div className={`${card} rounded-2xl p-5`}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-indigo-500" />
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Your Latest Scores
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {TESTS.filter((t) => getScore(t.id) !== undefined).map((t) => (
              <div
                key={t.id}
                className={`p-3 rounded-xl text-center ${isDark ? "bg-[#0f1726] border border-[#2d3449]" : "bg-slate-50 border border-slate-200"}`}
              >
                <div className="text-lg mb-1">{t.badge}</div>
                <div
                  className={`text-xl font-black tabular-nums ${scoreColor(getScore(t.id))}`}
                >
                  {getScore(t.id)}
                </div>
                <div className={`text-xs font-bold mt-0.5 ${sub}`}>
                  {t.title}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Test cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {TESTS.map((test) => {
          const score = getScore(test.id);
          const hasScore = score !== undefined;
          const Icon = test.icon;

          return (
            <div
              key={test.id}
              className={`${card} rounded-2xl p-6 flex flex-col justify-between
                hover:-translate-y-1 hover:shadow-lg transition-all duration-200 relative overflow-hidden group cursor-pointer`}
              onClick={() => navigate(test.path)}
            >
              {/* Completed ribbon */}
              {hasScore && (
                <div className="absolute top-0 right-0 bg-emerald-500 text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> Done
                </div>
              )}

              {/* Gradient accent on hover */}
              <div
                className={`absolute inset-0 bg-gradient-to-br from-${test.color}-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
              />

              <div>
                {/* Icon + score row */}
                <div className="flex items-start justify-between mb-4">
                  <div
                    className={`p-3 rounded-xl border ${isDark ? test.iconBgDark : test.iconBgLight} shadow-sm group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-7 h-7" />
                  </div>
                  {hasScore ? (
                    <div className="text-right">
                      <div
                        className={`text-2xl font-black tabular-nums ${scoreColor(score)}`}
                      >
                        {score}
                      </div>
                      <div
                        className={`text-[10px] font-bold uppercase tracking-widest ${sub}`}
                      >
                        Score
                      </div>
                    </div>
                  ) : (
                    <div className="text-2xl">{test.badge}</div>
                  )}
                </div>

                <h3 className={`text-base font-bold mb-1 ${text}`}>
                  {test.title}
                </h3>
                <p
                  className={`text-sm leading-relaxed line-clamp-2 mb-3 ${sub}`}
                >
                  {test.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${difficultyColor(test.difficulty)}`}
                  >
                    {test.difficulty}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-slate-700 text-slate-300" : "bg-slate-100 text-slate-600"}`}
                  >
                    {test.duration}
                  </span>
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded-full ${isDark ? "bg-indigo-500/20 text-indigo-400" : "bg-indigo-50 text-indigo-600"}`}
                  >
                    {test.detects}
                  </span>
                </div>
              </div>

              {/* CTA button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(test.path);
                }}
                className={`mt-5 w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                  hasScore
                    ? isDark
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100"
                    : "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20"
                }`}
              >
                {hasScore ? (
                  <>
                    <RotateCcwIcon /> Retake Test
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4" /> Start Test
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Small inline icon
const RotateCcwIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 12a9 9 0 101.5-5.04M3 3v5h5"
    />
  </svg>
);

export default TestsPage;
