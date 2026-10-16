import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Brain,
  Fingerprint,
  Phone,
  HeartPulse,
  ShieldCheck,
  ArrowRight,
  ChevronLeft,
  ArrowLeft,
  Bot,
  UserRound,
  Loader2,
} from "lucide-react";
import { useStore } from "../store/useStore";
import {
  sendOtp,
  verifyOtp,
  lookupPatientByPhone,
  lookupCaregiverByUid,
  lookupOrCreatePatientUser,
} from "../firebase/authService";

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const loginAction = useStore((state) => state.login);
  const caregiverProfile = useStore((state) => state.user); // already populated after OTP verify
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [step, setStep] = useState("phone"); // 'phone' | 'otp'
  const [loginType, setLoginType] = useState("patient"); // 'patient' | 'caregiver'

  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const phoneE164 = `+91${phone.replace(/\s/g, "")}`;
      await sendOtp(phoneE164);
      setStep("otp");
    } catch (err) {
      console.error("OTP send error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const credential = await verifyOtp(otp.join(""));
      const uid = credential.user.uid;
      const phoneE164 = `+91${phone.replace(/\s/g, "")}`;

      if (loginType === "caregiver") {
        // Caregiver OTP verified — now fetch their profile and show role select
        const profile = await lookupCaregiverByUid(uid);
        // Store temporarily (will be overridden with correct role after selection)
        loginAction(
          profile || { uid, phone, name: "Caregiver User", role: "caregiver" },
          "caregiver",
        );
        setStep("caregiver_role_select");
      } else {
        // Patient OTP verified — lookup their profile, create users doc if first login
        const patientProfile = await lookupOrCreatePatientUser(uid, phoneE164);
        loginAction(
          patientProfile || {
            uid,
            phone,
            name: "Patient User",
            role: "patient",
          },
          "patient",
        );
        navigate("/app/dashboard");
      }
    } catch (err) {
      console.error("OTP verify error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBiometric = () => {
    loginAction({ phone: "bio", name: "Patient User" }, "patient");
    navigate("/app/dashboard");
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-[#dae2fd] flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans antialiased">
      {/* Decorative Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-400/10 rounded-full filter blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-400/10 rounded-full filter blur-[100px]" />

      {/* Professional Back Button */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Home
      </button>

      <div className="w-full max-w-md z-10">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-400 to-indigo-700 shadow-xl mb-6 shadow-indigo-500/30">
            <Brain className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tracking-tight antialiased">
            {t("app_name")}
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 text-sm">
            Early Detection, Better Care.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white dark:bg-[#131b2e] rounded-3xl shadow-2xl border border-slate-200 dark:border-[#2d3449] p-8">
          {/* Role Tabs */}
          {step !== "caregiver_role_select" && (
            <div className="flex justify-center space-x-4 mb-8 border-b border-slate-200 dark:border-[#2d3449]">
              <button
                onClick={() => {
                  setLoginType("patient");
                  setStep("phone");
                }}
                className={`flex items-center space-x-2 pb-3 border-b-2 font-semibold px-2 transition-colors text-sm ${
                  loginType === "patient"
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <Phone className="w-4 h-4" />
                <span>Patient</span>
              </button>
              <button
                onClick={() => {
                  setLoginType("caregiver");
                  setStep("phone");
                }}
                className={`flex items-center space-x-2 pb-3 border-b-2 font-semibold px-2 transition-colors text-sm ${
                  loginType === "caregiver"
                    ? "border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                <HeartPulse className="w-4 h-4" />
                <span>{t("login.caregiver_login")}</span>
              </button>
            </div>
          )}

          {/* Phone Step */}
          {step === "phone" && (
            <form onSubmit={handleSendOtp} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                  Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500 dark:text-slate-400 font-medium text-sm">
                    +91
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="block w-full pl-14 pr-4 py-3 bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-[#2d3449] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base transition-colors placeholder:text-slate-400 dark:placeholder:text-slate-600 text-slate-900 dark:text-[#dae2fd]"
                    placeholder="98765 43210"
                  />
                </div>
              </div>

              {loginType === "caregiver" && (
                <div>
                  <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full px-4 py-3 bg-slate-50 dark:bg-[#0b1326] border border-slate-200 dark:border-[#2d3449] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-[#dae2fd]"
                    placeholder="Enter password"
                  />
                </div>
              )}

              <button
                id="send-otp-btn"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 disabled:opacity-60 transition-all hover:scale-[0.99] active:scale-[0.97]"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                <span>
                  {loading
                    ? "Sending OTP..."
                    : loginType === "patient"
                      ? t("login.send_otp")
                      : "Sign In"}
                </span>
                {!loading && <ArrowRight className="w-4 h-4" />}
              </button>

              {loginType === "patient" && (
                <>
                  <div className="relative flex items-center py-2">
                    <div className="flex-1 border-t border-slate-200 dark:border-[#2d3449]" />
                    <span className="px-3 bg-white dark:bg-[#131b2e] text-slate-400 text-xs font-medium">
                      OR
                    </span>
                    <div className="flex-1 border-t border-slate-200 dark:border-[#2d3449]" />
                  </div>

                  <button
                    type="button"
                    onClick={handleBiometric}
                    className="w-full flex items-center justify-center space-x-3 py-3 px-4 rounded-xl border border-slate-200 dark:border-[#2d3449] bg-slate-50 dark:bg-[#0b1326] text-slate-700 dark:text-slate-300 font-semibold hover:border-indigo-400 dark:hover:border-indigo-500 transition-all group"
                  >
                    <Fingerprint className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                    <span className="text-sm">
                      {t("login.biometric_login")}
                    </span>
                  </button>
                </>
              )}
            </form>
          )}

          {/* OTP Step */}
          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-6">
              <div className="flex items-center space-x-2 mb-2">
                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-[#0b1326] transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div>
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Enter OTP
                  </p>
                  <p className="text-xs text-slate-400">Sent to +91 {phone}</p>
                </div>
              </div>

              <div className="flex justify-between gap-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-2xl font-bold bg-slate-50 dark:bg-[#0b1326] border-2 border-slate-200 dark:border-[#2d3449] rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors text-slate-900 dark:text-[#dae2fd] outline-none"
                    placeholder="·"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 transition-all hover:scale-[0.99] active:scale-[0.97]"
              >
                <span>{t("login.verify_otp")}</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                Didn't receive OTP?{" "}
                <button
                  type="button"
                  className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline"
                >
                  Resend
                </button>
              </p>
            </form>
          )}

          {/* Caregiver Role Selection Step */}
          {step === "caregiver_role_select" && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                  Choose Dashboard
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                  Select which profile you want to access for this session.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <button
                  onClick={() => {
                    // Profile already fetched into store during OTP verify — just navigate
                    navigate("/app/dashboard");
                  }}
                  className="flex items-center gap-4 w-full relative group overflow-hidden rounded-2xl border-2 border-indigo-100 dark:border-indigo-500/30 bg-white dark:bg-slate-800 p-5 hover:border-indigo-500 dark:hover:border-indigo-400 text-left transition-all"
                >
                  <div className="bg-indigo-50 dark:bg-indigo-500/20 p-3 rounded-xl flex-shrink-0">
                    <HeartPulse className="w-6 h-6 text-indigo-600 dark:text-indigo-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Caregiver Portal
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Manage patients & view analytics
                    </p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    // Reuse already-fetched caregiver profile to create patient session
                    const p = caregiverProfile;
                    loginAction(
                      p
                        ? {
                            uid: p.uid,
                            phone: p.patientPhone || phone,
                            name: p.patientName || "Patient",
                            firstName: p.patientFirstName || "",
                            lastName: p.patientLastName || "",
                            age: p.patientAge || "",
                            email: p.patientEmail || "",
                            patientDocId: p.patientDocId || null,
                          }
                        : { phone, name: "Patient User" },
                      "patient",
                    );
                    navigate("/app/dashboard");
                  }}
                  className="flex items-center gap-4 w-full relative group overflow-hidden rounded-2xl border-2 border-emerald-100 dark:border-emerald-500/30 bg-white dark:bg-slate-800 p-5 hover:border-emerald-500 dark:hover:border-emerald-400 text-left transition-all"
                >
                  <div className="bg-emerald-50 dark:bg-emerald-500/20 p-3 rounded-xl flex-shrink-0">
                    <UserRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400 group-hover:scale-110 transition-transform" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">
                      Patient Dashboard
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Log in directly for your patient
                    </p>
                  </div>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setStep("phone")}
                className="w-full mt-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
              >
                Go Back
              </button>
            </div>
          )}

          {/* Register Link */}
          {step === "phone" && (
            <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
              >
                Register Here
              </button>
            </div>
          )}
        </div>

        {/* Security badge */}
        <div className="mt-6 flex justify-center items-center text-slate-400 dark:text-slate-500 text-xs font-medium">
          <ShieldCheck className="w-4 h-4 mr-2 text-emerald-500" />
          End-to-End Encrypted & Secure
        </div>
      </div>
    </div>
  );
};

export default Login;
