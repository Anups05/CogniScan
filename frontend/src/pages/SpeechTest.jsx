import React, { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import { db } from "../firebase/config";
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore";
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Mic,
  MicOff,
  ChevronRight,
  CheckCircle2,
  Brain,
  Activity,
  AlertCircle,
  Loader2,
  Volume2,
  Timer,
  MessageSquare,
  Sparkles,
  BarChart2,
  Info,
  RotateCcw,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const SILENCE_THRESHOLD = 0.015;
const SILENCE_DURATION_P1 = 4000;
const SILENCE_DURATION_P2 = 5000;

// ─────────────────────────────────────────────────────────────────────────────
// Waveform Canvas
// ─────────────────────────────────────────────────────────────────────────────
const WaveformCanvas = ({ analyserNode, isRecording, isDark }) => {
  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const W = canvas.width;
    const H = canvas.height;

    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      ctx.clearRect(0, 0, W, H);

      if (!analyserNode || !isRecording) {
        ctx.beginPath();
        ctx.strokeStyle = isDark ? "#2d3449" : "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.moveTo(0, H / 2);
        ctx.lineTo(W, H / 2);
        ctx.stroke();
        return;
      }

      const bufferLength = analyserNode.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      analyserNode.getByteTimeDomainData(dataArray);

      ctx.beginPath();
      const sliceWidth = W / bufferLength;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * H) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }
      ctx.lineTo(W, H / 2);

      const grad = ctx.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, "#6366f1");
      grad.addColorStop(0.5, "#8b5cf6");
      grad.addColorStop(1, "#6366f1");
      ctx.strokeStyle = grad;
      ctx.lineWidth = 2.5;
      ctx.stroke();
    };

    draw();
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [analyserNode, isRecording, isDark]);

  return (
    <canvas
      ref={canvasRef}
      width={600}
      height={80}
      className="w-full h-20 rounded-xl"
      style={{ background: isDark ? "#0f1726" : "#f8fafc" }}
    />
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Score Gauge
// ─────────────────────────────────────────────────────────────────────────────
const ScoreGauge = ({ score, isDark }) => {
  const clamp = Math.max(0, Math.min(100, score));
  const color = clamp >= 75 ? "#10b981" : clamp >= 50 ? "#f59e0b" : "#ef4444";
  const label = clamp >= 75 ? "Good" : clamp >= 50 ? "Moderate" : "Concerning";
  const radius = 52;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (clamp / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={130} height={130} viewBox="0 0 130 130">
        {/* Track */}
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          stroke={isDark ? "#2d3449" : "#e2e8f0"}
          strokeWidth={10}
        />
        {/* Progress */}
        <circle
          cx={65}
          cy={65}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 65 65)"
          style={{
            transition: "stroke-dashoffset 1.2s cubic-bezier(.4,0,.2,1)",
          }}
        />
        <text
          x={65}
          y={60}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={22}
          fontWeight={900}
          fill={color}
        >
          {clamp}
        </text>
        <text
          x={65}
          y={79}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize={10}
          fontWeight={700}
          fill={isDark ? "#94a3b8" : "#64748b"}
        >
          / 100
        </text>
      </svg>
      <span
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {label}
      </span>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Score Breakdown Table
// ─────────────────────────────────────────────────────────────────────────────
const ScoreBreakdown = ({ breakdown, overallScore, isDark }) => {
  if (!breakdown?.length) return null;

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#0f1726] border-[#2d3449]" : "bg-slate-50 border-slate-200"}`}
    >
      {/* Header */}
      <div
        className={`px-5 py-3 border-b flex items-center gap-2 ${isDark ? "border-[#2d3449] bg-[#131b2e]" : "border-slate-200 bg-slate-100"}`}
      >
        <TrendingUp className="w-4 h-4 text-indigo-500" />
        <p
          className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-300" : "text-slate-600"}`}
        >
          How the Score Was Calculated
        </p>
        <span
          className={`ml-auto text-sm font-black ${
            overallScore >= 75
              ? "text-emerald-500"
              : overallScore >= 50
                ? "text-amber-500"
                : "text-rose-500"
          }`}
        >
          {overallScore}/100
        </span>
      </div>

      {/* Rows */}
      <div className="divide-y divide-slate-100 dark:divide-[#2d3449]">
        {breakdown.map((row, i) => {
          const barColor =
            row.raw_score >= 75
              ? "bg-emerald-500"
              : row.raw_score >= 50
                ? "bg-amber-500"
                : "bg-rose-500";

          return (
            <div
              key={i}
              className={`px-5 py-3 ${isDark ? "hover:bg-[#1a2440]" : "hover:bg-white"} transition-colors`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${isDark ? "text-slate-200" : "text-slate-700"}`}
                  >
                    {row.component}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded font-bold ${isDark ? "bg-[#2d3449] text-slate-400" : "bg-slate-200 text-slate-500"}`}
                  >
                    ×{row.weight_pct}%
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black tabular-nums ${
                      row.raw_score >= 75
                        ? "text-emerald-500"
                        : row.raw_score >= 50
                          ? "text-amber-500"
                          : "text-rose-500"
                    }`}
                  >
                    {row.raw_score}/100
                  </span>
                  <span
                    className={`text-xs ${isDark ? "text-slate-500" : "text-slate-400"}`}
                  >
                    → +{row.contribution.toFixed(1)}pts
                  </span>
                </div>
              </div>
              {/* Mini bar */}
              <div
                className={`w-full h-1.5 rounded-full ${isDark ? "bg-[#2d3449]" : "bg-slate-200"}`}
              >
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${barColor}`}
                  style={{ width: `${row.raw_score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Formula footnote */}
      <div
        className={`px-5 py-3 border-t text-xs ${isDark ? "border-[#2d3449] text-slate-500" : "border-slate-200 text-slate-400"}`}
      >
        Score = Σ (component score × weight). Quantitative metrics from Groq
        Whisper timestamps; qualitative metrics from Groq LLaMA.
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Longest Pause Hero Banner
// ─────────────────────────────────────────────────────────────────────────────
const LongestPauseBanner = ({ longestPause, pauseCount, isDark }) => {
  const severity =
    longestPause >= 5
      ? "critical"
      : longestPause >= 3
        ? "notable"
        : longestPause >= 1
          ? "mild"
          : "normal";

  const config = {
    critical: {
      bg: isDark
        ? "bg-rose-500/10 border-rose-500/40"
        : "bg-rose-50 border-rose-300",
      numCls: "text-rose-500",
      lblCls: isDark ? "text-rose-400" : "text-rose-600",
      icon: "🔴",
      label: "Clinically Significant",
      detail:
        "May indicate word-finding difficulty or loss of train of thought",
    },
    notable: {
      bg: isDark
        ? "bg-amber-500/10 border-amber-500/40"
        : "bg-amber-50 border-amber-300",
      numCls: "text-amber-500",
      lblCls: isDark ? "text-amber-400" : "text-amber-600",
      icon: "🟡",
      label: "Notable Pause",
      detail: "Momentary hesitation or thought-gathering",
    },
    mild: {
      bg: isDark
        ? "bg-blue-500/10 border-blue-500/40"
        : "bg-blue-50 border-blue-200",
      numCls: "text-blue-500",
      lblCls: isDark ? "text-blue-400" : "text-blue-600",
      icon: "🟢",
      label: "Brief Pause",
      detail: "Within normal conversational range",
    },
    normal: {
      bg: isDark
        ? "bg-slate-700/40 border-slate-600"
        : "bg-slate-50 border-slate-200",
      numCls: isDark ? "text-slate-300" : "text-slate-600",
      lblCls: isDark ? "text-slate-400" : "text-slate-500",
      icon: "✅",
      label: "No Significant Pause",
      detail: "Excellent speech fluency — no long pauses detected",
    },
  }[severity];

  return (
    <div
      className={`rounded-2xl border-2 p-5 flex items-center gap-5 ${config.bg}`}
    >
      {/* Large pause time */}
      <div className="flex-shrink-0 text-center">
        <div
          className={`text-5xl font-black tabular-nums leading-none ${config.numCls}`}
        >
          {longestPause >= 0 ? `${longestPause}s` : "—"}
        </div>
        <div className={`text-xs font-bold mt-1 ${config.lblCls}`}>
          LONGEST PAUSE
        </div>
      </div>

      {/* Divider */}
      <div
        className={`w-px self-stretch ${isDark ? "bg-[#2d3449]" : "bg-slate-200"}`}
      />

      {/* Detail */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">{config.icon}</span>
          <span className={`text-sm font-bold ${config.lblCls}`}>
            {config.label}
          </span>
        </div>
        <p
          className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}
        >
          {config.detail}
        </p>
        {pauseCount > 0 && (
          <p
            className={`text-xs mt-1.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
          >
            <Clock className="w-3 h-3 inline mr-1" />
            {pauseCount} total pause{pauseCount !== 1 ? "s" : ""} (≥0.5s)
            detected in this response
          </p>
        )}
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Analysis Result Card (per prompt)
// ─────────────────────────────────────────────────────────────────────────────
const AnalysisCard = ({ result, promptNumber, isDark }) => {
  if (!result) return null;
  const { transcript, analysis, prompt } = result;

  const radarData = [
    { subject: "Coherence", value: (analysis.coherence_score || 0) * 10 },
    { subject: "Vocabulary", value: (analysis.vocabulary_richness || 0) * 10 },
    { subject: "Topic Focus", value: (analysis.topic_maintenance || 0) * 10 },
    {
      subject: "Fluency",
      value: Math.max(0, 100 - (analysis.hesitation_markers || 0) * 8),
    },
    {
      subject: "No Repeat",
      value: Math.max(0, 100 - (analysis.repetition_count || 0) * 15),
    },
  ];

  const metricCard = (label, value, color, icon) => (
    <div
      className={`flex flex-col items-center justify-center p-3 rounded-xl border ${
        isDark
          ? "bg-[#0f1726] border-[#2d3449]"
          : "bg-slate-50 border-slate-200"
      }`}
    >
      <span
        className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-slate-400" : "text-slate-500"}`}
      >
        {label}
      </span>
      <span className={`text-2xl font-black ${color}`}>{value}</span>
      <span className="text-xs mt-0.5">{icon}</span>
    </div>
  );

  return (
    <div
      className={`rounded-2xl border overflow-hidden ${isDark ? "bg-[#1a2440] border-[#2d3449]" : "bg-white border-slate-200 shadow-sm"}`}
    >
      {/* Header */}
      <div
        className={`px-5 py-4 border-b flex items-center gap-3 ${isDark ? "border-[#2d3449] bg-[#131b2e]" : "border-slate-100 bg-slate-50"}`}
      >
        <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <p
            className={`font-bold text-sm ${isDark ? "text-white" : "text-slate-900"}`}
          >
            Prompt {promptNumber} Analysis
          </p>
          <p
            className={`text-xs ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            {prompt?.type === "daily_recall"
              ? "Daily Recall"
              : "Cognitive Test"}
          </p>
        </div>

        {/* Overall score badge */}
        {analysis.overall_score != null && (
          <span
            className={`ml-auto text-sm font-black px-3 py-1.5 rounded-full ${
              analysis.overall_score >= 75
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                : analysis.overall_score >= 50
                  ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                  : "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
            }`}
          >
            Score: {analysis.overall_score}/100
          </span>
        )}
      </div>

      <div className="p-5 space-y-5">
        {/* ── LONGEST PAUSE HERO ── */}
        <LongestPauseBanner
          longestPause={analysis.longest_pause_sec || 0}
          pauseCount={analysis.pause_count || 0}
          isDark={isDark}
        />

        {/* Prompt question */}
        <div
          className={`p-3 rounded-xl border-l-4 border-indigo-500 ${isDark ? "bg-indigo-500/10" : "bg-indigo-50"}`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
          >
            Question Asked
          </p>
          <p
            className={`text-sm ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            {prompt?.text}
          </p>
        </div>

        {/* Patient transcript (speech-to-text) */}
        <div>
          <p
            className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
          >
            Patient's Answer — Speech-to-Text Transcript
          </p>
          <div
            className={`p-3 rounded-xl text-sm leading-relaxed ${isDark ? "bg-[#0f1726] text-slate-300" : "bg-slate-50 text-slate-700"}`}
          >
            {transcript || (
              <span className="italic opacity-50">No transcript available</span>
            )}
          </div>
        </div>

        {/* 6-metric grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {metricCard(
            "Speaking Rate",
            `${analysis.speaking_rate_wpm ?? "—"} WPM`,
            "text-indigo-500",
            "🗣️",
          )}
          {metricCard(
            "Total Pauses",
            analysis.pause_count ?? "—",
            "text-amber-500",
            "⏸️",
          )}
          {metricCard(
            "Longest Pause",
            analysis.longest_pause_sec ? `${analysis.longest_pause_sec}s` : "—",
            "text-rose-500",
            "⏳",
          )}
          {metricCard(
            "Fillers (uh/um…)",
            analysis.hesitation_markers ?? "—",
            "text-orange-500",
            "💬",
          )}
          {metricCard(
            "Word Repetitions",
            analysis.repetition_count ?? "—",
            "text-purple-500",
            "🔁",
          )}
          {metricCard(
            "Response Duration",
            analysis.audio_duration_sec
              ? `${analysis.audio_duration_sec}s`
              : "—",
            "text-emerald-500",
            "⏱️",
          )}
        </div>

        {/* Pause breakdown pills */}
        {analysis.pause_list?.length > 0 && (
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              All Pauses — Longest First
            </p>
            <div className="flex flex-wrap gap-2">
              {analysis.pause_list.map((p, i) => (
                <span
                  key={i}
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    p >= 5
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400"
                      : p >= 2
                        ? "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {p}s {p >= 5 ? "🔴" : p >= 2 ? "🟡" : "🟢"}
                </span>
              ))}
            </div>
            <p
              className={`text-xs mt-1.5 ${isDark ? "text-slate-500" : "text-slate-400"}`}
            >
              🔴 ≥5s significant · 🟡 2–5s notable · 🟢 &lt;2s brief
            </p>
          </div>
        )}

        {/* Score gauge + radar side by side on desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 items-center">
          {analysis.overall_score != null && (
            <div
              className={`flex flex-col items-center gap-2 p-4 rounded-2xl border ${isDark ? "bg-[#0f1726] border-[#2d3449]" : "bg-slate-50 border-slate-200"}`}
            >
              <p
                className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-slate-400" : "text-slate-500"}`}
              >
                Overall Cognitive Score
              </p>
              <ScoreGauge score={analysis.overall_score} isDark={isDark} />
            </div>
          )}

          {/* Radar chart */}
          <div>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-3 ${isDark ? "text-slate-400" : "text-slate-500"}`}
            >
              Cognitive Dimensions
            </p>
            <ResponsiveContainer width="100%" height={180}>
              <RadarChart data={radarData}>
                <PolarGrid stroke={isDark ? "#2d3449" : "#e2e8f0"} />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fill: isDark ? "#94a3b8" : "#64748b" }}
                />
                <PolarRadiusAxis
                  domain={[0, 100]}
                  tick={false}
                  axisLine={false}
                />
                <Radar
                  dataKey="value"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.25}
                  strokeWidth={2}
                />
                <Tooltip
                  contentStyle={{
                    background: isDark ? "#1a2440" : "#fff",
                    border: "1px solid #6366f1",
                    borderRadius: 8,
                    color: isDark ? "#dae2fd" : "#1e293b",
                    fontSize: 12,
                  }}
                  formatter={(v) => [`${v.toFixed(0)}%`, ""]}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── SCORE BREAKDOWN ── */}
        {analysis.score_breakdown?.length > 0 && (
          <ScoreBreakdown
            breakdown={analysis.score_breakdown}
            overallScore={analysis.overall_score}
            isDark={isDark}
          />
        )}

        {/* Pause interpretation */}
        {analysis.pause_interpretation && (
          <div
            className={`p-4 rounded-xl border flex gap-3 ${
              isDark
                ? "bg-rose-500/10 border-rose-500/30"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            <span className="text-xl flex-shrink-0">⏸️</span>
            <div>
              <p
                className={`text-xs font-bold uppercase tracking-wider mb-1 ${isDark ? "text-rose-400" : "text-rose-600"}`}
              >
                Pause Interpretation
              </p>
              <p
                className={`text-sm leading-relaxed ${isDark ? "text-rose-200" : "text-rose-800"}`}
              >
                {analysis.pause_interpretation}
              </p>
            </div>
          </div>
        )}

        {/* Cognitive flags */}
        {analysis.cognitive_flags?.length > 0 && (
          <div
            className={`p-4 rounded-xl border ${isDark ? "bg-amber-500/10 border-amber-500/30" : "bg-amber-50 border-amber-200"}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-500" />
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                Clinical Observations
              </p>
            </div>
            <ul className="space-y-1">
              {analysis.cognitive_flags.map((flag, i) => (
                <li
                  key={i}
                  className={`text-sm ${isDark ? "text-amber-300" : "text-amber-700"}`}
                >
                  • {flag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Clinical summary */}
        <div
          className={`p-4 rounded-xl ${isDark ? "bg-indigo-500/10" : "bg-indigo-50"}`}
        >
          <p
            className={`text-xs font-bold uppercase tracking-wider mb-2 ${isDark ? "text-indigo-400" : "text-indigo-600"}`}
          >
            Clinical Summary
          </p>
          <p
            className={`text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-slate-700"}`}
          >
            {analysis.summary}
          </p>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Main SpeechTest Page
// ─────────────────────────────────────────────────────────────────────────────
const SpeechTest = () => {
  const { t } = useTranslation();
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  const [phase, setPhase] = useState("idle");
  const [prompts, setPrompts] = useState(null);
  const [promptIndex, setPromptIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const [saveStatus, setSaveStatus] = useState("idle"); // idle | saving | saved | error

  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [silenceSecondsLeft, setSilenceSecondsLeft] = useState(null);
  const [currentVolume, setCurrentVolume] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const sourceRef = useRef(null);
  const streamRef = useRef(null);
  const silenceStartRef = useRef(null);
  const volumeRafRef = useRef(null);
  const timerRef = useRef(null);
  const speechRecRef = useRef(null);

  const currentPrompt = prompts
    ? promptIndex === 0
      ? prompts.prompt_1
      : prompts.prompt_2
    : null;
  const silenceDuration =
    promptIndex === 0 ? SILENCE_DURATION_P1 : SILENCE_DURATION_P2;

  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449]"
    : "bg-white border border-slate-200 shadow-sm";
  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const sub = isDark ? "text-slate-400" : "text-slate-500";

  // ── Load prompts ───────────────────────────────────────────────────────────
  const loadPrompts = useCallback(async () => {
    setPhase("idle");
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/speech/prompts`);
      if (!res.ok) throw new Error("Failed to load prompts");
      const data = await res.json();
      setPrompts(data);
      setPhase("prompts_loaded");
    } catch {
      setError(
        "Could not connect to the speech analysis server. Make sure the backend is running.",
      );
      setPhase("idle");
    }
  }, []);

  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // ── Volume monitor ─────────────────────────────────────────────────────────
  const startVolumeMonitor = useCallback(
    (stream) => {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);

      audioContextRef.current = ctx;
      analyserRef.current = analyser;
      sourceRef.current = source;

      const dataArr = new Uint8Array(analyser.fftSize);

      const check = () => {
        volumeRafRef.current = requestAnimationFrame(check);
        analyser.getByteTimeDomainData(dataArr);
        const rms =
          Math.sqrt(
            dataArr.reduce((s, v) => s + (v - 128) ** 2, 0) / dataArr.length,
          ) / 128;
        setCurrentVolume(rms);

        if (rms < SILENCE_THRESHOLD) {
          if (!silenceStartRef.current) silenceStartRef.current = Date.now();
          const elapsed = Date.now() - silenceStartRef.current;
          const remaining = Math.max(
            0,
            Math.ceil((silenceDuration - elapsed) / 1000),
          );
          setSilenceSecondsLeft(remaining);
          if (elapsed >= silenceDuration) {
            setSilenceSecondsLeft(null);
            silenceStartRef.current = null;
            stopAndAnalyze();
          }
        } else {
          silenceStartRef.current = null;
          setSilenceSecondsLeft(null);
        }
      };
      check();
    },
    [silenceDuration],
  );

  // ── Start recording ────────────────────────────────────────────────────────
  const startRecording = useCallback(async () => {
    setError("");
    setLiveTranscript("");
    audioChunksRef.current = [];
    silenceStartRef.current = null;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.start(200);
      setIsRecording(true);
      setPhase("recording");
      setRecordingSeconds(0);

      timerRef.current = setInterval(
        () => setRecordingSeconds((s) => s + 1),
        1000,
      );
      startVolumeMonitor(stream);
      startLiveTranscript();
    } catch {
      setError(
        "Microphone access denied. Please allow microphone access and try again.",
      );
    }
  }, [startVolumeMonitor]);

  // ── Live transcript ────────────────────────────────────────────────────────
  const startLiveTranscript = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const rec = new SR();
    rec.continuous = true;
    rec.interimResults = true;
    rec.lang = "en-IN";
    rec.onresult = (e) => {
      let full = "";
      for (let i = 0; i < e.results.length; i++)
        full += e.results[i][0].transcript + " ";
      setLiveTranscript(full.trim());
    };
    rec.onerror = () => {};
    rec.start();
    speechRecRef.current = rec;
  };

  // ── Stop + analyze ─────────────────────────────────────────────────────────
  const stopAndAnalyze = useCallback(async () => {
    if (
      !mediaRecorderRef.current ||
      mediaRecorderRef.current.state === "inactive"
    )
      return;

    setIsRecording(false);
    setPhase("analyzing");
    setSilenceSecondsLeft(null);
    clearInterval(timerRef.current);
    cancelAnimationFrame(volumeRafRef.current);

    try {
      speechRecRef.current?.stop();
    } catch {}
    try {
      audioContextRef.current?.close();
    } catch {}
    analyserRef.current = null;

    const blob = await new Promise((resolve) => {
      mediaRecorderRef.current.onstop = () =>
        resolve(new Blob(audioChunksRef.current, { type: "audio/webm" }));
      mediaRecorderRef.current.stop();
    });

    streamRef.current?.getTracks().forEach((t) => t.stop());

    try {
      const formData = new FormData();
      formData.append("audio", blob, `prompt_${promptIndex + 1}.webm`);
      formData.append("prompt_type", currentPrompt?.type || "daily_recall");
      formData.append("prompt_text", currentPrompt?.text || "");

      const res = await fetch(`${API_URL}/api/speech/analyze`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Analysis API error");
      const data = await res.json();

      const sessionResult = {
        transcript: data.transcript,
        analysis: data.analysis,
        prompt: currentPrompt,
        promptText: currentPrompt?.text || "",
        promptType: currentPrompt?.type || "",
        audioBlob: blob,
      };

      setResults((prev) => {
        const updated = [...prev, sessionResult];

        if (promptIndex === 0) {
          setPromptIndex(1);
          setPhase("between");
          setLiveTranscript("");
          setRecordingSeconds(0);
        } else {
          setPhase("results");
          saveSession(updated);
        }

        return updated;
      });
    } catch {
      setError(
        "Analysis failed. Please check your internet connection and try again.",
      );
      setPhase(promptIndex === 0 ? "prompts_loaded" : "between");
    }
  }, [promptIndex, currentPrompt]);

  // ── Save full session to Firestore ─────────────────────────────────────────
  const saveSession = async (sessionResults) => {
    if (!user?.uid) return;
    setSaveStatus("saving");
    try {
      const sessionId = `speech_${Date.now()}`;
      const avgScore =
        sessionResults.reduce(
          (s, r) => s + (r.analysis?.overall_score || 0),
          0,
        ) / sessionResults.length;
      const avgCoherence =
        sessionResults.reduce(
          (s, r) => s + (r.analysis?.coherence_score || 0),
          0,
        ) / sessionResults.length;
      const maxPause = Math.max(
        ...sessionResults.map((r) => r.analysis?.longest_pause_sec || 0),
      );

      await setDoc(
        doc(db, "speech_sessions", user.uid, "sessions", sessionId),
        {
          // Session metadata
          uid: user.uid,
          patientName: user.name || user.email || "",
          sessionId,
          createdAt: serverTimestamp(),

          // Aggregate scores
          overallScore: parseFloat(avgScore.toFixed(1)),
          overallCoherence: parseFloat(avgCoherence.toFixed(2)),
          longestPauseInSession: maxPause,

          // Per-prompt detailed records
          responses: sessionResults.map((r, idx) => ({
            promptIndex: idx + 1,
            promptText: r.promptText, // The question asked
            promptType: r.promptType, // daily_recall | cognitive
            speechToText: r.transcript || "", // Raw Groq Whisper transcript

            // Quantitative metrics (from Whisper timestamps)
            pauseCount: r.analysis?.pause_count ?? 0,
            longestPauseSec: r.analysis?.longest_pause_sec ?? 0,
            pauseList: r.analysis?.pause_list ?? [],
            hesitationMarkers: r.analysis?.hesitation_markers ?? 0,
            repetitionCount: r.analysis?.repetition_count ?? 0,
            speakingRateWpm: r.analysis?.speaking_rate_wpm ?? 0,
            audioDurationSec: r.analysis?.audio_duration_sec ?? 0,

            // Qualitative metrics (from LLaMA)
            coherenceScore: r.analysis?.coherence_score ?? 0,
            vocabularyRichness: r.analysis?.vocabulary_richness ?? 0,
            topicMaintenance: r.analysis?.topic_maintenance ?? 0,
            responseAdequacy: r.analysis?.response_adequacy ?? 0,
            sentiment: r.analysis?.sentiment ?? "neutral",
            cognitiveFlags: r.analysis?.cognitive_flags ?? [],
            pauseInterpretation: r.analysis?.pause_interpretation ?? "",
            clinicalSummary: r.analysis?.summary ?? "",

            // Composite score
            overallScore: r.analysis?.overall_score ?? 0,
            scoreBreakdown: r.analysis?.score_breakdown ?? [],
          })),
        },
      );

      setSaveStatus("saved");
    } catch (e) {
      console.error("Firestore save error:", e);
      setSaveStatus("error");
    }
  };

  // ── Reset ──────────────────────────────────────────────────────────────────
  const handleReset = () => {
    setResults([]);
    setPromptIndex(0);
    setLiveTranscript("");
    setRecordingSeconds(0);
    setSilenceSecondsLeft(null);
    setSaveStatus("idle");
    loadPrompts();
  };

  const fmt = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-2xl font-extrabold tracking-tight ${text}`}>
            🎤 Speech Analysis
          </h1>
          <p className={`text-sm mt-1 ${sub}`}>
            Two-prompt cognitive speech session — speak naturally, take your
            time.
          </p>
        </div>
        {phase === "results" && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
          >
            <RotateCcw className="w-4 h-4" /> New Session
          </button>
        )}
      </div>

      {/* Progress steps */}
      <div className={`rounded-2xl p-4 ${card}`}>
        <div className="flex items-center gap-3">
          {["Prompt 1", "Prompt 2", "Results"].map((label, i) => {
            const done =
              (i === 0 && results.length >= 1) ||
              (i === 1 && results.length >= 2) ||
              (i === 2 && phase === "results");
            const active =
              (i === 0 && promptIndex === 0 && phase !== "results") ||
              (i === 1 && promptIndex === 1 && phase !== "results") ||
              (i === 2 && phase === "results");
            return (
              <React.Fragment key={i}>
                <div className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 transition-all ${
                      done
                        ? "bg-emerald-500 text-white"
                        : active
                          ? "bg-indigo-600 text-white"
                          : isDark
                            ? "bg-[#2d3449] text-slate-400"
                            : "bg-slate-100 text-slate-400"
                    }`}
                  >
                    {done ? <CheckCircle2 className="w-3.5 h-3.5" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs font-bold ${active ? (isDark ? "text-indigo-400" : "text-indigo-600") : done ? (isDark ? "text-emerald-400" : "text-emerald-600") : sub}`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`h-0.5 flex-1 rounded-full transition-all ${done ? "bg-emerald-500" : isDark ? "bg-[#2d3449]" : "bg-slate-200"}`}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Error banner */}
      {error && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <p className="text-sm text-rose-700 dark:text-rose-400">{error}</p>
        </div>
      )}

      {/* ── IDLE ── */}
      {phase === "idle" && !error && (
        <div className={`rounded-2xl p-10 text-center ${card}`}>
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mx-auto mb-4" />
          <p className={`font-bold ${text}`}>Loading session prompts…</p>
        </div>
      )}

      {/* ── PROMPTS LOADED / BETWEEN ── */}
      {(phase === "prompts_loaded" || phase === "between") && currentPrompt && (
        <div className="space-y-4">
          <div
            className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? "bg-indigo-500/10 border-indigo-500/30" : "bg-indigo-50 border-indigo-200"}`}
          >
            <Info className="w-4 h-4 text-indigo-500 mt-0.5 flex-shrink-0" />
            <p
              className={`text-sm ${isDark ? "text-indigo-300" : "text-indigo-700"}`}
            >
              {promptIndex === 0
                ? 'Speak naturally about your day. The session will auto-advance after a 4-second pause, or click "Next Prompt" when done.'
                : "Answer this cognitive question in as much detail as you can. The session ends after a 5-second pause."}
            </p>
          </div>

          <div className={`rounded-2xl p-8 space-y-4 ${card}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                {promptIndex === 0 ? (
                  <Volume2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                ) : (
                  <Brain className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                )}
              </div>
              <p
                className={`text-xs font-bold uppercase tracking-wider ${sub}`}
              >
                Prompt {promptIndex + 1} of 2 —{" "}
                {promptIndex === 0 ? "Daily Recall" : "Cognitive Test"}
              </p>
            </div>
            <p className={`text-xl font-bold leading-relaxed ${text}`}>
              {currentPrompt.text}
            </p>
            <button
              onClick={startRecording}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[0.99]"
            >
              <Mic className="w-4 h-4" /> Start Recording
            </button>
          </div>
        </div>
      )}

      {/* ── RECORDING ── */}
      {phase === "recording" && (
        <div className="space-y-4">
          <div className={`rounded-2xl p-5 ${card}`}>
            <p
              className={`text-xs font-bold uppercase tracking-wider mb-2 ${sub}`}
            >
              Prompt {promptIndex + 1} —{" "}
              {promptIndex === 0 ? "Daily Recall" : "Cognitive Test"}
            </p>
            <p className={`text-base font-semibold leading-relaxed ${text}`}>
              {currentPrompt?.text}
            </p>
          </div>

          <div className={`rounded-2xl p-6 space-y-4 ${card}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <span className={`text-sm font-bold ${text}`}>Recording</span>
              </div>
              <div className="flex items-center gap-3">
                {silenceSecondsLeft !== null && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-400">
                    Auto-advance in {silenceSecondsLeft}s
                  </span>
                )}
                <span className={`font-mono text-sm font-bold ${text}`}>
                  {fmt(recordingSeconds)}
                </span>
              </div>
            </div>

            <WaveformCanvas
              analyserNode={analyserRef.current}
              isRecording={isRecording}
              isDark={isDark}
            />

            <div
              className={`min-h-[60px] p-3 rounded-xl text-sm leading-relaxed ${isDark ? "bg-[#0f1726] text-slate-300" : "bg-slate-50 text-slate-700"}`}
            >
              {liveTranscript || (
                <span className={`italic ${sub}`}>Listening… speak now</span>
              )}
            </div>

            <button
              onClick={stopAndAnalyze}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm bg-indigo-600 text-white hover:bg-indigo-700 transition-all"
            >
              {promptIndex === 0 ? (
                <>
                  <ChevronRight className="w-4 h-4" /> Next Prompt
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Finish Session
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── ANALYZING ── */}
      {phase === "analyzing" && (
        <div
          className={`rounded-2xl p-12 flex flex-col items-center gap-5 text-center ${card}`}
        >
          <div className="w-16 h-16 rounded-2xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
            <Brain className="w-8 h-8 text-indigo-500 animate-pulse" />
          </div>
          <div>
            <p className={`text-lg font-bold ${text}`}>Analyzing speech…</p>
            <p className={`text-sm mt-1 ${sub}`}>
              Groq AI is transcribing and scoring your response
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce"
                style={{ animationDelay: `${i * 0.2}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {phase === "results" && results.length > 0 && (
        <div className="space-y-6">
          {/* Session summary banner */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-5 h-5 text-yellow-300" />
              <p className="font-bold text-lg">Session Complete</p>
              {/* Save status */}
              <span
                className={`ml-auto text-xs font-bold px-2.5 py-1 rounded-full ${
                  saveStatus === "saved"
                    ? "bg-emerald-500/30 text-emerald-200"
                    : saveStatus === "saving"
                      ? "bg-white/20 text-white"
                      : saveStatus === "error"
                        ? "bg-rose-500/30 text-rose-200"
                        : ""
                }`}
              >
                {saveStatus === "saving"
                  ? "⏳ Saving…"
                  : saveStatus === "saved"
                    ? "✓ Saved to profile"
                    : saveStatus === "error"
                      ? "⚠ Save failed"
                      : ""}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  Avg Score
                </p>
                <p className="text-3xl font-black mt-1">
                  {(
                    results.reduce(
                      (s, r) => s + (r.analysis?.overall_score || 0),
                      0,
                    ) / results.length
                  ).toFixed(1)}
                  <span className="text-lg text-indigo-200">/100</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  Avg Coherence
                </p>
                <p className="text-3xl font-black mt-1">
                  {(
                    results.reduce(
                      (s, r) => s + (r.analysis?.coherence_score || 0),
                      0,
                    ) / results.length
                  ).toFixed(1)}
                  <span className="text-lg text-indigo-200">/10</span>
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  Avg WPM
                </p>
                <p className="text-3xl font-black mt-1">
                  {Math.round(
                    results.reduce(
                      (s, r) => s + (r.analysis?.speaking_rate_wpm || 0),
                      0,
                    ) / results.length,
                  )}
                </p>
              </div>
              <div>
                <p className="text-indigo-200 text-xs font-bold uppercase tracking-wider">
                  Longest Pause
                </p>
                <p className="text-3xl font-black mt-1">
                  {Math.max(
                    ...results.map((r) => r.analysis?.longest_pause_sec || 0),
                  )}
                  s
                </p>
              </div>
            </div>
          </div>

          {/* Per-prompt analysis cards */}
          {results.map((r, i) => (
            <AnalysisCard
              key={i}
              result={r}
              promptNumber={i + 1}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default SpeechTest;
