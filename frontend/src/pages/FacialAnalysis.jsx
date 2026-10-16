import React from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import {
  Camera,
  Scan,
  AlertCircle,
  Smile as SmileIcon,
  Meh,
  EyeOff,
} from "lucide-react";

const FacialAnalysis = () => {
  const { t } = useTranslation();
  const { theme } = useStore();
  const isDark = theme === "dark";

  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const subtext = isDark ? "text-slate-400" : "text-slate-500";
  const card = isDark ? "#1a2440" : "#ffffff";
  const cardBorder = isDark ? "#2d3449" : "#e2e8f0";
  const rowBg = isDark ? "#131b2e" : "#f8fafc";
  const rowBorder = isDark ? "#2d3449" : "#f1f5f9";

  const emotions = [
    {
      label: t("facial.neutral_joy"),
      value: "68%",
      icon: SmileIcon,
      color: "text-emerald-500",
      bg: isDark ? "bg-emerald-500/15" : "bg-emerald-100",
    },
    {
      label: t("facial.confusion"),
      value: "14%",
      icon: Meh,
      color: "text-amber-500",
      bg: isDark ? "bg-amber-500/15" : "bg-amber-100",
    },
    {
      label: t("facial.lack_emotion"),
      value: "8%",
      icon: EyeOff,
      color: "text-rose-500",
      bg: isDark ? "bg-rose-500/15" : "bg-rose-100",
    },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div
        style={{ backgroundColor: card, borderColor: cardBorder }}
        className="rounded-2xl p-6 border shadow-sm"
      >
        <h1 className={`text-2xl font-bold ${text}`}>{t("facial.title")}</h1>
        <p className={`mt-1 text-sm ${subtext}`}>{t("facial.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Camera Feed */}
        <div className="md:col-span-2 bg-slate-900 rounded-2xl overflow-hidden shadow-xl relative aspect-video flex flex-col items-center justify-center border-2 border-slate-800">
          {/* Dark overlay */}
          <div className="absolute inset-0 bg-slate-800 opacity-40" />

          {/* Scanner line */}
          <div className="absolute top-0 left-0 w-full h-0.5 bg-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.8)] animate-bounce" />

          {/* Bounding box */}
          <div className="relative z-10 w-44 h-52 border-2 border-dashed border-indigo-400/70 rounded flex flex-col items-center justify-between p-2">
            <div className="flex justify-between w-full">
              <div className="w-4 h-4 border-t-2 border-l-2 border-indigo-400" />
              <div className="w-4 h-4 border-t-2 border-r-2 border-indigo-400" />
            </div>
            <div className="bg-slate-900/70 text-indigo-300 text-xs px-2 py-1 rounded-md backdrop-blur">
              {t("facial.face_detected")}
            </div>
            <div className="flex justify-between w-full">
              <div className="w-4 h-4 border-b-2 border-l-2 border-indigo-400" />
              <div className="w-4 h-4 border-b-2 border-r-2 border-indigo-400" />
            </div>
          </div>

          {/* Bottom controls */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center z-20">
            <div className="flex space-x-2">
              <button className="bg-white/10 hover:bg-white/20 p-2 rounded-full backdrop-blur-md transition-colors">
                <Camera className="w-5 h-5 text-white" />
              </button>
              <button className="bg-white/10 hover:bg-white/20 py-2 px-3 rounded-full backdrop-blur-md transition-colors text-white text-xs font-semibold">
                {t("facial.switch_camera")}
              </button>
            </div>
            <div className="flex items-center space-x-2 bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full text-xs font-bold border border-rose-500/40 backdrop-blur-md animate-pulse">
              <AlertCircle className="w-4 h-4" />
              <span>{t("facial.live_analysis")}</span>
            </div>
          </div>
        </div>

        {/* Emotion Panel */}
        <div
          style={{ backgroundColor: card, borderColor: cardBorder }}
          className="rounded-2xl p-5 border shadow-sm flex flex-col"
        >
          <h3
            className={`text-base font-bold mb-4 flex items-center gap-2 ${text}`}
          >
            <Scan className="w-4 h-4 text-indigo-500" />
            {t("facial.detected_states")}
          </h3>

          <div className="space-y-3 flex-1">
            {emotions.map((em) => (
              <div
                key={em.label}
                style={{ backgroundColor: rowBg, borderColor: rowBorder }}
                className="flex items-center justify-between p-3 rounded-xl border"
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${em.bg}`}>
                    <em.icon className={`w-4 h-4 ${em.color}`} />
                  </div>
                  <span className={`font-semibold text-sm ${text}`}>
                    {em.label}
                  </span>
                </div>
                <span className={`font-extrabold text-base ${em.color}`}>
                  {em.value}
                </span>
              </div>
            ))}
          </div>

          <div
            style={{ borderTopColor: cardBorder }}
            className="mt-5 pt-4 border-t"
          >
            <p className={`text-xs leading-relaxed text-center ${subtext}`}>
              {t("facial.privacy_note")}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacialAnalysis;
