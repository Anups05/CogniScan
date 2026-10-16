import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  Mic,
  Eye,
  Headphones,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

const DUAL_TASKS = [
  {
    id: "speech_memory",
    title: "Speech + Memory",
    badge: "🎤 + 🧠",
    desc: "Talk about your day AND remember 3 words. Detects cognitive load handling.",
    icon: Mic,
    color: "indigo",
    mockDetails:
      'Instruction: "Tell me what you had for breakfast while holding the words APPLE, BIRD, CAR in your mind."',
  },
  {
    id: "tap_visual",
    title: "Tap + Visual Tracking",
    badge: "👆 + 👁️",
    desc: "Tap when symbol appears while tracking a moving object. Detects attention and coordination.",
    icon: Eye,
    color: "amber",
    mockDetails:
      'Instruction: "Follow the bouncing ball with your eyes, but tap the screen whenever a red flash occurs. Keep focus!"',
  },
  {
    id: "audio_math",
    title: "Audio + Calculation",
    badge: "🎧 + 🔢",
    desc: "Hear numbers spoken out loud and solve simple math. Detects working memory capability.",
    icon: Headphones,
    color: "emerald",
    mockDetails:
      'Instruction: "Listen to the numbers spoken. If I say 12 and 5, type 17. Solve as many as you can while the distraction noise plays."',
  },
];

const DualTasksPage = () => {
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  const [activeTest, setActiveTest] = useState(null);
  const [phase, setPhase] = useState("list"); // list | active | result
  const [lastScore, setLastScore] = useState(null);

  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";

  const startTest = (t) => {
    setActiveTest(t);
    setPhase("active");
  };

  const completeTest = async () => {
    // Generate a reasonable mock score for testing
    const score = Math.floor(Math.random() * 30 + 60); // 60 - 90
    setLastScore(score);
    setPhase("result");

    if (user?.uid) {
      try {
        await setDoc(
          doc(
            db,
            "cognitive_scores",
            user.uid,
            "tests",
            `dualtask_${activeTest.id}_${Date.now()}`,
          ),
          {
            testType: `dualtask_${activeTest.id}`,
            score,
            createdAt: serverTimestamp(),
            metadata: { completed: true, game: activeTest.title },
          },
        );
      } catch (e) {
        console.error("Failed to save dual task score", e);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
          Dual Tasks
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Advanced multi-tasking challenges. Doing two things at once is a
          strong indicator of cognitive load handling.
        </p>
      </div>

      {phase === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {DUAL_TASKS.map((t) => (
            <div
              key={t.id}
              className={`${card} rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer`}
              onClick={() => startTest(t)}
            >
              <div>
                <div
                  className={`p-3 rounded-xl bg-${t.color}-50 dark:bg-${t.color}-500/10 text-${t.color}-500 inline-block mb-4`}
                >
                  <t.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold mb-1 ${text}`}>
                  {t.title}
                </h3>
                <p className={`text-xs font-bold text-slate-400 mb-2`}>
                  {t.badge}
                </p>
                <p className={`text-sm leading-relaxed ${sub}`}>{t.desc}</p>
              </div>
              <button
                className={`mt-5 w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-${t.color}-100 dark:bg-${t.color}-500/20 text-${t.color}-700 dark:text-${t.color}-400 hover:bg-${t.color}-200 dark:hover:bg-${t.color}-500/30 transition-colors`}
              >
                <ArrowRight className="w-4 h-4" /> Start Challenge
              </button>
            </div>
          ))}
        </div>
      )}

      {phase === "active" && activeTest && (
        <div
          className={`${card} rounded-3xl p-10 text-center space-y-6 max-w-xl mx-auto`}
        >
          <div
            className={`mx-auto w-16 h-16 rounded-2xl bg-${activeTest.color}-100 dark:bg-${activeTest.color}-500/20 flex items-center justify-center text-3xl mb-4`}
          >
            {activeTest.badge.split(" ")[0]}
          </div>
          <h2 className={`text-2xl font-black ${text}`}>{activeTest.title}</h2>
          <p className={`text-sm ${sub} italic`}>{activeTest.desc}</p>

          <div
            className={`p-5 rounded-2xl text-left ${isDark ? "bg-[#0f1726] border border-[#2d3449]" : "bg-slate-50 border border-slate-200"}`}
          >
            <p className={`text-sm font-bold mb-2 ${text}`}>
              Challenge Details:
            </p>
            <p className={`text-sm ${sub}`}>{activeTest.mockDetails}</p>
            <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center min-h-[150px] bg-white dark:bg-[#1a2440]">
              <p className="text-sm font-bold text-slate-500">
                Interactive Test Component Goes Here...
              </p>
            </div>
          </div>

          <button
            onClick={completeTest}
            className={`w-full py-3 rounded-xl font-bold text-sm bg-${activeTest.color}-500 text-white hover:bg-${activeTest.color}-600 transition-colors`}
          >
            Simulate Completion & Save Score
          </button>
        </div>
      )}

      {phase === "result" && (
        <div
          className={`${card} rounded-3xl p-10 text-center space-y-6 max-w-sm mx-auto`}
        >
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto" />
          <div>
            <p className={`text-xs font-bold uppercase tracking-wider ${sub}`}>
              Dual Task Score
            </p>
            <div
              className={`text-6xl font-black tabular-nums ${lastScore >= 80 ? "text-emerald-500" : "text-amber-500"}`}
            >
              {lastScore}
              <span className="text-2xl text-slate-400">/100</span>
            </div>
          </div>

          <button
            onClick={() => setPhase("list")}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> Back to Dual Tasks
          </button>
        </div>
      )}
    </div>
  );
};

export default DualTasksPage;
