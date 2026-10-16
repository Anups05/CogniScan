// Register.jsx — Only caregivers register. They fill in patient AND caregiver details.
// Authentication: Firebase Phone OTP. Storage: Cloud Firestore.
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Brain,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  HeartPulse,
  Sun,
  Moon,
  Eye,
  EyeOff,
  Phone,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { useStore } from "../store/useStore";
import {
  sendOtp,
  verifyOtp,
  saveRegistrationToFirestore,
} from "../firebase/authService";

// Reusable input field
const Field = ({
  label,
  type = "text",
  placeholder,
  required = true,
  value,
  onChange,
  hint,
}) => (
  <div>
    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <input
      type={type}
      required={required}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
    />
    {hint && <p className="text-xs text-slate-400 mt-1">{hint}</p>}
  </div>
);

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login: loginAction, theme, toggleTheme } = useStore();

  // Patient fields
  const [patient, setPatient] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    age: "",
    email: "",
    phone: "",
  });

  // Caregiver fields
  const [caregiver, setCaregiver] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    relation: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState("form"); // 'form' | 'otp' | 'saving'
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);

  const setPF = (key) => (e) =>
    setPatient((p) => ({ ...p, [key]: e.target.value }));
  const setCF = (key) => (e) =>
    setCaregiver((c) => ({ ...c, [key]: e.target.value }));

  // Step 1: Validate form and send OTP to caregiver's phone
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    if (caregiver.password !== caregiver.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (caregiver.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const phoneE164 = `+91${caregiver.phone.replace(/\s/g, "")}`;
      await sendOtp(phoneE164);
      setStep("otp");
    } catch (err) {
      console.error(err);
      setError(
        "Failed to send OTP. Please check the phone number and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP → then save all details to Firestore
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const otpString = otp.join("");
      const credential = await verifyOtp(otpString);
      const uid = credential.user.uid;
      setStep("saving");
      await saveRegistrationToFirestore(uid, patient, caregiver);
      // Store user in Zustand
      loginAction(
        {
          uid,
          name: `${caregiver.firstName} ${caregiver.lastName}`,
          email: caregiver.email,
          phone: caregiver.phone,
          relation: caregiver.relation,
          patientName: `${patient.firstName} ${patient.lastName}`,
          patientAge: patient.age,
          patientPhone: patient.phone,
          patientEmail: patient.email,
        },
        "caregiver",
      );
      navigate("/app/dashboard");
    } catch (err) {
      console.error(err);
      setError(
        err.code === "auth/invalid-verification-code"
          ? "Incorrect OTP. Please try again."
          : "Verification failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5)
      document.getElementById(`reg-otp-${index + 1}`)?.focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      document.getElementById(`reg-otp-${index - 1}`)?.focus();
  };

  const relations = [
    "Son",
    "Daughter",
    "Spouse / Partner",
    "Parent",
    "Sibling",
    "Grandchild",
    "Friend",
    "Professional Caregiver",
    "Other",
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b1326] text-slate-900 dark:text-[#dae2fd] flex flex-col items-center py-12 px-4 relative overflow-hidden transition-colors duration-300">
      {/* Blobs */}
      <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-indigo-400/10 dark:bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-5%] w-96 h-96 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-4 right-4 z-50 p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-colors"
        title="Toggle theme"
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5" />
        ) : (
          <Moon className="w-5 h-5" />
        )}
      </button>

      {/* Professional Back Button */}
      <button
        onClick={() => navigate("/login")}
        className="absolute top-6 left-6 sm:top-8 sm:left-8 z-50 flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-slate-200/50 dark:border-slate-700/50 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400 shadow-sm transition-all group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        Login
      </button>

      <div className="w-full max-w-2xl z-10 pt-10 sm:pt-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-xl shadow-indigo-500/30 mb-4">
            <Brain className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            {t("app_name")} — Caregiver Registration
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            As a caregiver, you register on behalf of your patient and manage
            their cognitive health journey.
          </p>
        </div>

        {/* ── Form Step: fill all details, send OTP ── */}
        {(step === "form" || step === "otp" || step === "saving") && (
          <form
            onSubmit={step === "form" ? handleSendOtp : handleVerifyOtp}
            className="space-y-6"
          >
            {/* Only show form fields if we are on the 'form' step */}
            {step === "form" && (
              <>
                {/* ── Patient Details ── */}
                <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base">
                        Patient Details
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Details of the person being monitored
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                      label="First Name"
                      placeholder="e.g. Ravi"
                      value={patient.firstName}
                      onChange={setPF("firstName")}
                    />
                    <Field
                      label="Middle Name"
                      placeholder="e.g. Kumar"
                      required={false}
                      value={patient.middleName}
                      onChange={setPF("middleName")}
                    />
                    <Field
                      label="Last Name"
                      placeholder="e.g. Sharma"
                      value={patient.lastName}
                      onChange={setPF("lastName")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                    <Field
                      label="Age"
                      type="number"
                      placeholder="e.g. 68"
                      value={patient.age}
                      onChange={setPF("age")}
                      hint="Patient's age in years"
                    />
                    <div className="sm:col-span-2">
                      <Field
                        label="Email Address"
                        type="email"
                        placeholder="patient@email.com"
                        required={false}
                        value={patient.email}
                        onChange={setPF("email")}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-400 font-semibold text-sm pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        className="w-full pl-14 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Patient's phone number"
                        value={patient.phone}
                        onChange={setPF("phone")}
                      />
                    </div>
                  </div>
                </div>

                {/* ── Caregiver Details ── */}
                <div className="bg-white dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
                      <HeartPulse className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="font-bold text-slate-900 dark:text-white text-base">
                        Caregiver Details
                      </h2>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        Your details as the caregiver / family member
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field
                      label="First Name"
                      placeholder="e.g. Priya"
                      value={caregiver.firstName}
                      onChange={setCF("firstName")}
                    />
                    <Field
                      label="Middle Name"
                      placeholder="e.g. Devi"
                      required={false}
                      value={caregiver.middleName}
                      onChange={setCF("middleName")}
                    />
                    <Field
                      label="Last Name"
                      placeholder="e.g. Sharma"
                      value={caregiver.lastName}
                      onChange={setCF("lastName")}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                        Relation to Patient{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={caregiver.relation}
                        onChange={setCF("relation")}
                        className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      >
                        <option value="" disabled>
                          Select relation
                        </option>
                        {relations.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>
                    </div>
                    <Field
                      label="Email Address"
                      type="email"
                      placeholder="caregiver@email.com"
                      value={caregiver.email}
                      onChange={setCF("email")}
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-500 dark:text-slate-400 font-semibold text-sm pointer-events-none">
                        +91
                      </span>
                      <input
                        type="tel"
                        required
                        className="w-full pl-14 pr-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="Your phone number"
                        value={caregiver.phone}
                        onChange={setCF("phone")}
                      />
                    </div>
                  </div>

                  {/* Password fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          placeholder="Min. 8 characters"
                          value={caregiver.password}
                          onChange={setCF("password")}
                          className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1.5 uppercase tracking-wider">
                        Confirm Password{" "}
                        <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          required
                          placeholder="Re-enter password"
                          value={caregiver.confirmPassword}
                          onChange={setCF("confirmPassword")}
                          className="w-full pl-4 pr-12 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                          {showPass ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-3 flex items-start gap-1.5">
                    <Brain className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                    Patients log in via OTP or fingerprint — no password needed
                    for them.
                  </p>
                </div>

                {/* Error */}
                {error && (
                  <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl p-4 text-sm font-medium">
                    {error}
                  </div>
                )}
              </>
            )}

            {/* ── OTP Verification Step ── */}
            {step === "otp" && (
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-8 text-center space-y-6">
                <div className="w-14 h-14 bg-indigo-50 dark:bg-indigo-500/20 rounded-2xl flex items-center justify-center mx-auto">
                  <Phone className="w-7 h-7 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg">
                    Verify Your Phone
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Enter the 6-digit OTP sent to{" "}
                    <strong>+91 {caregiver.phone}</strong>
                  </p>
                </div>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      id={`reg-otp-${index}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      className="w-11 h-14 text-center text-xl font-bold rounded-xl border-2 bg-slate-50 dark:bg-slate-900 dark:text-white border-slate-200 dark:border-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  ))}
                </div>
                {error && (
                  <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400 rounded-xl p-3 text-sm font-medium">
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || otp.join("").length < 6}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/25 transition-all"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  {loading ? "Verifying..." : "Verify & Register"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError("");
                  }}
                  className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 font-medium"
                >
                  ← Go Back
                </button>
              </div>
            )}

            {/* ── Saving state ── */}
            {step === "saving" && (
              <div className="bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
                <p className="font-bold text-slate-700 dark:text-slate-200">
                  Saving your details...
                </p>
                <p className="text-sm text-slate-400">
                  Please wait while we set up your account.
                </p>
              </div>
            )}

            {/* Submit button — only shown on form step */}
            {step === "form" && (
              <>
                <button
                  id="send-otp-btn"
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 disabled:opacity-60 shadow-lg shadow-indigo-500/25 transition-all hover:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Phone className="w-4 h-4" />
                  )}
                  {loading ? "Sending OTP..." : "Continue - Send OTP"}
                </button>

                <p className="text-center text-xs text-slate-500 dark:text-slate-400">
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                  >
                    Login Here
                  </button>
                </p>
              </>
            )}
          </form>
        )}

        <div className="mt-8 flex justify-center items-center text-xs text-slate-400 dark:text-slate-500 gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          End-to-End Encrypted & Secure
        </div>
      </div>
    </div>
  );
};

export default Register;
