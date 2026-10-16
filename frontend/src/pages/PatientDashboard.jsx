import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import {
  Activity,
  Mic,
  Clock,
  Layers,
  TrendingUp,
  Flame,
  ChevronRight,
  Sparkles,
  Edit3,
} from "lucide-react";

const PatientDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { theme, user } = useStore();
  const isDark = theme === "dark";

  const card = isDark
    ? "bg-[#1a2440] border border-[#2d3449] rounded-2xl p-5"
    : "bg-white border border-slate-200 rounded-2xl p-5 shadow-sm";

  const text = isDark ? "text-[#dae2fd]" : "text-slate-900";
  const subtext = isDark ? "text-slate-400" : "text-slate-500";

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Daily Check-in Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-indigo-800 p-6 text-white shadow-lg shadow-indigo-500/20">
        <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/5 rounded-full" />
        <div className="absolute -right-4 -bottom-10 w-28 h-28 bg-white/5 rounded-full" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-indigo-200 text-xs font-semibold uppercase tracking-wider">
                {t("dashboard.daily_active")}
              </span>
            </div>
            <h2 className="text-xl font-extrabold flex flex-wrap gap-x-2">
              <span>
                {t("dashboard.hi", "Hi")}{" "}
                {user?.firstName ||
                  user?.patientName?.split(" ")[0] ||
                  user?.name?.split(" ")[0] ||
                  ""}
                ,
              </span>
              <span>
                {t("dashboard.ready_quest", "Ready for your daily quest?")}
              </span>
            </h2>
            <p className="text-indigo-200 text-sm mt-1 max-w-sm">
              {t("dashboard.daily_desc")}
            </p>
          </div>
          <button
            onClick={() => navigate("/app/speech")}
            className="flex items-center space-x-2 bg-white text-indigo-700 hover:bg-indigo-50 font-bold py-3 px-5 rounded-xl transition-all active:scale-95 shadow-md whitespace-nowrap text-sm"
          >
            <Mic className="w-4 h-4" />
            <span>{t("dashboard.start_diary")}</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-4">
        {[
          {
            label: t("dashboard.current_streak", "Current Streak"),
            value: "7",
            unit: t("dashboard.days", "Days"),
            color: "text-amber-500",
            icon: Flame,
            bg: isDark ? "bg-amber-500/10" : "bg-amber-50",
          },
          {
            label: t("dashboard.last_session", "Last Session"),
            value: "2",
            unit: t("dashboard.days_ago", "days ago"),
            color: "text-emerald-500",
            icon: Clock,
            bg: isDark ? "bg-emerald-500/10" : "bg-emerald-50",
          },
        ].map((stat) => (
          <div key={stat.label} className={card}>
            <div className={`inline-flex p-2 rounded-xl mb-3 ${stat.bg}`}>
              <stat.icon className={`w-5 h-5 ${stat.color}`} />
            </div>
            <p
              className={`text-xs font-semibold uppercase tracking-wide ${subtext}`}
            >
              {stat.label}
            </p>
            <p className={`text-2xl font-extrabold mt-1 ${text}`}>
              {stat.value}
              {stat.unit && (
                <span className={`text-sm font-medium ml-1 ${subtext}`}>
                  {stat.unit}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Cognitive Tests Section */}
      <div>
        <h3
          className={`text-lg font-bold mb-4 flex items-center gap-2 ${text}`}
        >
          <Layers className="w-5 h-5 text-indigo-500" />
          {t("dashboard.cognitive_tests")}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Clock Drawing Test */}
          <div
            className={`${card} flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all hover:-translate-y-0.5 group`}
            onClick={() => navigate("/app/test/clock")}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-xl ${isDark ? "bg-rose-500/15" : "bg-rose-50"}`}
              >
                <Clock className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <p className={`font-bold ${text}`}>
                  {t("dashboard.clock_test")}
                </p>
                <p className={`text-xs mt-0.5 ${subtext}`}>
                  {t("dashboard.clock_desc")}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 ${subtext} group-hover:text-indigo-500 transition-colors`}
            />
          </div>

          {/* Dual Task Test */}
          <div
            className={`${card} flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-all hover:-translate-y-0.5 group`}
            onClick={() => navigate("/app/test/dualtask")}
          >
            <div className="flex items-center space-x-4">
              <div
                className={`p-3 rounded-xl ${isDark ? "bg-purple-500/15" : "bg-purple-50"}`}
              >
                <Edit3 className="w-6 h-6 text-purple-500" />
              </div>
              <div>
                <p className={`font-bold ${text}`}>
                  {t("dashboard.dual_task")}
                </p>
                <p className={`text-xs mt-0.5 ${subtext}`}>
                  {t("dashboard.dual_desc")}
                </p>
              </div>
            </div>
            <ChevronRight
              className={`w-5 h-5 ${subtext} group-hover:text-indigo-500 transition-colors`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard;
