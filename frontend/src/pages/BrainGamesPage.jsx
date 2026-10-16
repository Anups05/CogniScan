import React, { useState } from "react";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  MessageSquare,
  Users,
  BookOpen,
  Hexagon,
  CheckCircle2,
  RotateCcw,
  ArrowRight,
} from "lucide-react";

const BRAIN_GAMES = [
  {
    id: "wordweave",
    title: "WordWeave",
    badge: "🧩 Language",
    desc: "Form words from a jumbled set of letters. Tests language and recall.",
    icon: MessageSquare,
    color: "emerald",
    mockDetails:
      'Instruction: "You have 60 seconds to find as many words as possible from these letters: A, E, R, T, S."',
  },
  {
    id: "facematch",
    title: "FaceMatch",
    badge: "👥 Memory",
    desc: "Remember faces shown briefly, identify them later. Tests visual memory.",
    icon: Users,
    color: "indigo",
    mockDetails:
      'Instruction: "Study the 3 faces for 5 seconds. Later, identify them from a lineup of 10 people."',
  },
  {
    id: "storychain",
    title: "StoryChain",
    badge: "📖 Coherence",
    desc: "Complete a story with a missing word. Tests semantic coherence and creativity.",
    icon: BookOpen,
    color: "amber",
    mockDetails:
      'Instruction: "Read the paragraph. Choose the word that best completes the logical flow of the story."',
  },
  {
    id: "shapeflip",
    title: "ShapeFlip",
    badge: "📐 Spatial",
    desc: "Mentally rotate shapes and match them. Tests spatial reasoning.",
    icon: Hexagon,
    color: "purple",
    mockDetails:
      'Instruction: "Which of the 4 shapes below is the main shape rotated 90 degrees clockwise?"',
  },
];

const BrainGamesPage = () => {
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  const [activeGame, setActiveGame] = useState(null);
  const [phase, setPhase] = useState("list"); // list | active | result
  const [lastScore, setLastScore] = useState(null);

  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";

  const startGame = (g) => {
    setActiveGame(g);
    setPhase("active");
  };

  const completeGame = async () => {
    // Generate a reasonable mock score for testing
    const score = Math.floor(Math.random() * 30 + 70); // 70 - 100
    setLastScore(score);
    setPhase("result");

    if (user?.uid) {
      try {
        await setDoc(
          doc(
            db,
            "cognitive_scores",
            user.uid,
            "training",
            `game_${activeGame.id}_${Date.now()}`,
          ),
          {
            gameType: activeGame.id,
            score,
            createdAt: serverTimestamp(),
            metadata: { completed: true, name: activeGame.title },
          },
        );
      } catch (e) {
        console.error("Failed to save brain game score", e);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
          Brain Training Games
        </h1>
        <p className={`text-sm mt-1 ${sub}`}>
          Fun, interactive exercises designed to challenge memory, spatial
          reasoning, and language skills.
        </p>
      </div>

      {phase === "list" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {BRAIN_GAMES.map((g) => (
            <div
              key={g.id}
              className={`${card} rounded-2xl p-6 flex flex-col justify-between hover:shadow-lg transition-transform hover:-translate-y-1 cursor-pointer`}
              onClick={() => startGame(g)}
            >
              <div>
                <div
                  className={`p-3 rounded-xl bg-${g.color}-50 dark:bg-${g.color}-500/10 text-${g.color}-500 inline-block mb-4`}
                >
                  <g.icon className="w-6 h-6" />
                </div>
                <h3 className={`text-base font-bold mb-1 ${text}`}>
                  {g.title}
                </h3>
                <p className={`text-xs font-bold text-slate-400 mb-2`}>
                  {g.badge}
                </p>
                <p className={`text-sm leading-relaxed ${sub}`}>{g.desc}</p>
              </div>
              <button
                className={`mt-5 w-full py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm bg-${g.color}-100 dark:bg-${g.color}-500/20 text-${g.color}-700 dark:text-${g.color}-400 hover:bg-${g.color}-200 dark:hover:bg-${g.color}-500/30 transition-colors`}
              >
                <ArrowRight className="w-4 h-4" /> Play {g.title}
              </button>
            </div>
          ))}
        </div>
      )}

      {phase === "active" && activeGame && (
        <div
          className={`${card} rounded-3xl p-10 text-center space-y-6 max-w-xl mx-auto`}
        >
          <div
            className={`mx-auto w-16 h-16 rounded-2xl bg-${activeGame.color}-100 dark:bg-${activeGame.color}-500/20 flex items-center justify-center text-3xl mb-4`}
          >
            {activeGame.badge.split(" ")[0]}
          </div>
          <h2 className={`text-2xl font-black ${text}`}>{activeGame.title}</h2>
          <p className={`text-sm ${sub} italic`}>{activeGame.desc}</p>

          <div
            className={`p-5 rounded-2xl text-left ${isDark ? "bg-[#0f1726] border border-[#2d3449]" : "bg-slate-50 border border-slate-200"}`}
          >
            <p className={`text-sm font-bold mb-2 ${text}`}>Game Details:</p>
            <p className={`text-sm ${sub}`}>{activeGame.mockDetails}</p>
            <div className="mt-4 p-4 rounded-xl border border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center min-h-[150px] bg-white dark:bg-[#1a2440]">
              <p className="text-sm font-bold text-slate-500">
                Interactive Game Canvas Goes Here...
              </p>
            </div>
          </div>

          <button
            onClick={completeGame}
            className={`w-full py-3 rounded-xl font-bold text-sm bg-${activeGame.color}-500 text-white hover:bg-${activeGame.color}-600 transition-colors`}
          >
            Simulate Gameplay & Save Score
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
              Game Score
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
            <RotateCcw className="w-4 h-4" /> Back to Brain Games
          </button>
        </div>
      )}
    </div>
  );
};

export default BrainGamesPage;
