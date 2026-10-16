import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useStore } from "../store/useStore";
import {
  Moon,
  Sun,
  Globe,
  User,
  Shield,
  LogOut,
  Lock,
  Edit2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import { doc, updateDoc } from "firebase/firestore";

const Settings = () => {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, role, user, logout } = useStore();
  const navigate = useNavigate();
  const isDark = theme === "dark";

  // Patient details — for patient role: their own data; for caregiver role: their linked patient
  const [patientDetails, setPatientDetails] = useState({
    name: role === "patient" ? user?.name || "" : user?.patientName || "",
    age: role === "patient" ? user?.age || "" : user?.patientAge || "",
    email: role === "patient" ? user?.email || "" : user?.patientEmail || "",
    phone: role === "patient" ? user?.phone || "" : user?.patientPhone || "",
  });

  const [caregiverDetails, setCaregiverDetails] = useState({
    name: user?.name || "",
    age: user?.age || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [twoFAEnabled, setTwoFAEnabled] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = async () => {
    try {
      if (role === "patient" && user?.uid) {
        // Update patient doc (keyed by phone digits)
        const digits = (user.phone || "").replace("+91", "").replace(/\s/g, "");
        if (digits) {
          await updateDoc(doc(db, "patients", `patient_${digits}`), {
            fullName: patientDetails.name,
            age: parseInt(patientDetails.age, 10) || 0,
          });
        }
      } else if (role === "caregiver" && user?.uid) {
        // Update caregiver doc
        await updateDoc(doc(db, "caregivers", user.uid), {
          fullName: caregiverDetails.name,
          email: caregiverDetails.email,
          phone: caregiverDetails.phone
            ? `+91${caregiverDetails.phone.replace("+91", "").replace(/\s/g, "")}`
            : "",
        });
        await updateDoc(doc(db, "users", user.uid), {
          name: caregiverDetails.name,
          email: caregiverDetails.email,
        });
        // Update linked patient if patientDocId is known
        if (user?.patientDocId) {
          await updateDoc(doc(db, "patients", user.patientDocId), {
            fullName: patientDetails.name,
            age: parseInt(patientDetails.age, 10) || 0,
            email: patientDetails.email,
            phone: patientDetails.phone
              ? `+91${patientDetails.phone.replace("+91", "").replace(/\s/g, "")}`
              : "",
          });
        }
      }
    } catch (err) {
      console.error("Save error:", err);
    }
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  const bg = isDark ? "#131b2e" : "#ffffff";
  const border = isDark ? "#2d3449" : "#e2e8f0";
  const sectionHeaderBg = isDark ? "#1a2440" : "#f8fafc";
  const rowBg = isDark ? "#0f1726" : "#f8fafc";
  const text = isDark ? "#dae2fd" : "#1e293b";
  const subtext = isDark ? "#94a3b8" : "#64748b";
  const iconBg = isDark ? "rgba(79,70,229,0.15)" : "#eef2ff";
  const iconColor = isDark ? "#a5b4fc" : "#4f46e5";

  const handleLanguageChange = (e) => i18n.changeLanguage(e.target.value);
  const handleLogout = () => {
    i18n.changeLanguage("en");
    logout();
    navigate("/login");
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div
      style={{ backgroundColor: bg, borderColor: border }}
      className="border rounded-2xl overflow-hidden shadow-sm"
    >
      <div
        style={{ backgroundColor: sectionHeaderBg, borderBottomColor: border }}
        className="flex items-center gap-3 px-5 py-4 border-b"
      >
        <div
          style={{ backgroundColor: iconBg }}
          className="w-8 h-8 rounded-lg flex items-center justify-center"
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <h3 style={{ color: text }} className="font-bold text-sm">
          {title}
        </h3>
      </div>
      <div className="p-5 space-y-3">{children}</div>
    </div>
  );

  const Row = ({ label, desc, children }) => (
    <div
      style={{ backgroundColor: rowBg, borderColor: border }}
      className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border"
    >
      <div>
        <p style={{ color: text }} className="font-semibold text-sm">
          {label}
        </p>
        {desc && (
          <p style={{ color: subtext }} className="text-xs mt-0.5">
            {desc}
          </p>
        )}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  );

  const InputField = ({ label, value, onChange, disabled, type = "text" }) => (
    <div className="flex flex-col gap-1.5">
      <label
        className="text-xs font-bold uppercase tracking-wider"
        style={{ color: subtext }}
      >
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors outline-none focus:ring-2 focus:ring-indigo-500
          ${disabled ? "opacity-60 cursor-not-allowed" : "hover:border-indigo-400"}`}
        style={{
          backgroundColor: disabled ? (isDark ? "#1a2440" : "#f1f5f9") : rowBg,
          borderColor: border,
          color: text,
        }}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h1
          style={{ color: text }}
          className="text-2xl font-extrabold tracking-tight"
        >
          {t("settings.title")}
        </h1>
        <p style={{ color: subtext }} className="text-sm mt-1">
          {t("settings.language_region")}, {t("settings.appearance")},{" "}
          {t("settings.account_actions")}
        </p>
      </div>

      {/* Profile banner */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-2xl p-6 shadow-xl shadow-indigo-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            <User className="w-8 h-8 text-white relative z-10" />
          </div>
          <div className="text-white">
            <p className="text-xl font-extrabold flex items-center gap-2">
              {role === "caregiver"
                ? caregiverDetails.name
                : patientDetails.name}
            </p>
            <p className="text-indigo-200 text-sm capitalize mt-0.5">
              {role} {t("settings.account_type")}
            </p>
            <span className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-300 bg-white/10 border border-white/20 px-2.5 py-1 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {t("settings.active_status")}
            </span>
          </div>
        </div>
        <button
          onClick={handleSave}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md ${isSaved ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-white text-indigo-700 hover:bg-slate-50"}`}
        >
          {isSaved ? (
            <CheckCircle2 className="w-4 h-4" />
          ) : (
            <Edit2 className="w-4 h-4" />
          )}
          {isSaved ? "Saved!" : "Save Details"}
        </button>
      </div>

      {/* Profile Details Sections based on Role */}
      {role === "patient" && (
        <Section icon={User} title="Patient Personal Details">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Full Name"
              value={patientDetails.name}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, name: e.target.value })
              }
              disabled={false}
            />
            <InputField
              label="Age"
              type="number"
              value={patientDetails.age ?? ""}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, age: e.target.value })
              }
              disabled={false}
            />
            <InputField
              label="Email Address"
              value={patientDetails.email || user?.email || ""}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, email: e.target.value })
              }
              disabled={true}
            />
            <InputField
              label="Phone Number"
              value={patientDetails.phone || user?.phone || ""}
              onChange={(e) =>
                setPatientDetails({ ...patientDetails, phone: e.target.value })
              }
              disabled={true}
            />
          </div>
        </Section>
      )}

      {role === "caregiver" && (
        <>
          <Section icon={User} title="My Caregiver Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Full Name"
                value={caregiverDetails.name}
                onChange={(e) =>
                  setCaregiverDetails({
                    ...caregiverDetails,
                    name: e.target.value,
                  })
                }
                disabled={false}
              />
              <InputField
                label="Relation to Patient"
                value={user?.relation || caregiverDetails.relation || ""}
                onChange={() => {}}
                disabled={true}
              />
              <InputField
                label="Email Address"
                value={caregiverDetails.email}
                onChange={(e) =>
                  setCaregiverDetails({
                    ...caregiverDetails,
                    email: e.target.value,
                  })
                }
                disabled={false}
              />
              <InputField
                label="Phone Number"
                value={caregiverDetails.phone}
                onChange={(e) =>
                  setCaregiverDetails({
                    ...caregiverDetails,
                    phone: e.target.value,
                  })
                }
                disabled={false}
              />
            </div>
          </Section>

          <Section icon={User} title="Linked Patient Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="Patient Full Name"
                value={patientDetails.name}
                onChange={(e) =>
                  setPatientDetails({ ...patientDetails, name: e.target.value })
                }
                disabled={false}
              />
              <InputField
                label="Patient Age"
                type="number"
                value={patientDetails.age}
                onChange={(e) =>
                  setPatientDetails({ ...patientDetails, age: e.target.value })
                }
                disabled={false}
              />
              <InputField
                label="Patient Email"
                value={patientDetails.email}
                onChange={(e) =>
                  setPatientDetails({
                    ...patientDetails,
                    email: e.target.value,
                  })
                }
                disabled={false}
              />
              <InputField
                label="Patient Phone"
                value={patientDetails.phone}
                onChange={(e) =>
                  setPatientDetails({
                    ...patientDetails,
                    phone: e.target.value,
                  })
                }
                disabled={false}
              />
            </div>
          </Section>
        </>
      )}

      {/* Language */}
      <Section icon={Globe} title={t("settings.language_region")}>
        <Row
          label={t("settings.display_language")}
          desc={t("settings.language_hint")}
        >
          <select
            onChange={handleLanguageChange}
            value={i18n.language}
            style={{
              backgroundColor: isDark ? "#0f1726" : "#f8fafc",
              borderColor: border,
              color: text,
            }}
            className="border text-sm font-medium rounded-xl px-4 py-2 outline-none cursor-pointer focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value="en">English</option>
            <option value="hi">हिंदी (Hindi)</option>
            <option value="mr">मराठी (Marathi)</option>
          </select>
        </Row>
      </Section>

      {/* Appearance */}
      <Section icon={isDark ? Moon : Sun} title={t("settings.appearance")}>
        <Row
          label={t("settings.theme_mode")}
          desc={isDark ? t("settings.enable_light") : t("settings.enable_dark")}
        >
          <button
            onClick={toggleTheme}
            style={{ backgroundColor: isDark ? "#4f46e5" : "#cbd5e1" }}
            className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            role="switch"
            aria-checked={isDark}
          >
            <span
              style={{
                transform: isDark
                  ? "translateX(1.75rem)"
                  : "translateX(0.25rem)",
              }}
              className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
            />
          </button>
        </Row>
      </Section>

      {/* Security */}
      <Section icon={Shield} title={t("settings.account_actions")}>
        {role === "caregiver" && (
          <>
            <Row
              label={t("settings.change_password")}
              desc="Update your caregiver account password"
            >
              <button
                style={{
                  backgroundColor: isDark ? "#1a2440" : "#f1f5f9",
                  borderColor: border,
                  color: text,
                }}
                className="flex items-center gap-2 px-4 py-2 border text-sm font-semibold rounded-xl hover:opacity-80 transition-opacity"
              >
                <Lock className="w-4 h-4" />
                {t("settings.change_password")}
              </button>
            </Row>

            <Row
              label="Two-Factor Authentication (2FA)"
              desc="Add an extra layer of security to your caregiver account"
            >
              <button
                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                style={{
                  backgroundColor: twoFAEnabled
                    ? "#10b981"
                    : isDark
                      ? "#475569"
                      : "#cbd5e1",
                }}
                className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                role="switch"
                aria-checked={twoFAEnabled}
              >
                <span
                  style={{
                    transform: twoFAEnabled
                      ? "translateX(1.75rem)"
                      : "translateX(0.25rem)",
                  }}
                  className="inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200"
                />
              </button>
            </Row>
          </>
        )}

        <div className="pt-2">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl border font-bold text-sm transition-colors"
            style={{
              borderColor: isDark ? "rgba(239,68,68,0.3)" : "#fecaca",
              backgroundColor: isDark ? "rgba(239,68,68,0.08)" : "#fff1f2",
              color: isDark ? "#f87171" : "#dc2626",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? "rgba(239,68,68,0.15)"
                : "#fee2e2";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = isDark
                ? "rgba(239,68,68,0.08)"
                : "#fff1f2";
            }}
          >
            <LogOut className="w-4 h-4" />
            {t("settings.sign_out")}
          </button>
        </div>
      </Section>
    </div>
  );
};

export default Settings;
