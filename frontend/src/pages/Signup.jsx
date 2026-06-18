/**
 * src/pages/Signup.jsx
 * ─────────────────────
 * WHY THIS FILE IS MODIFIED:
 *   • `username` field completely removed.
 *   • Password strength indicator added.
 *   • On success: navigates to /verify-email-sent (not /dashboard)
 *     because user must verify email first.
 *   • Uses centralised api.js instead of hard-coded URL.
 *   • Client-side validation mirrors backend rules.
 */

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../utils/api";

// ── Password strength scorer ─────────────────────────────────────────────
function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8)                      score++;
  if (/[A-Z]/.test(pw))                    score++;
  if (/[a-z]/.test(pw))                    score++;
  if (/\d/.test(pw))                       score++;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(pw))  score++;
  return score; // 0-5
}

const STRENGTH_LABELS = ["", "Very weak", "Weak", "Fair", "Strong", "Very strong"];
const STRENGTH_COLORS = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#0d9488"];

export default function Signup() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "", email: "", phone: "", organization: "",
    password: "", confirmPassword: "",
  });
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const strength = scorePassword(form.password);

  // ── Validation ──────────────────────────────────────────────────────
  const validate = () => {
    const errs = {};
    if (form.full_name.trim().length < 2)
      errs.full_name = "Name must be at least 2 characters.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = "Enter a valid email address.";
    if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone))
      errs.phone = "Enter a valid phone number.";
    if (!form.organization.trim())
      errs.organization = "Organization name is required.";
    if (strength < 3)
      errs.password = "Password is too weak. Use uppercase, lowercase, number and symbol.";
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = "Passwords do not match.";
    return errs;
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setFieldErrors({ ...fieldErrors, [e.target.name]: undefined });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setFieldErrors(errs); return; }

    setLoading(true);
    setError("");
    try {
      await api.post("/auth/signup/", {
        full_name:    form.full_name,
        email:        form.email,
        phone:        form.phone,
        organization: form.organization,
        password:     form.password,
      });
      // Navigate to a page that tells user to check their email
      navigate("/verify-email-sent", { state: { email: form.email } });
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        // Map backend field errors to fieldErrors state
        const mapped = {};
        for (const [key, val] of Object.entries(data)) {
          mapped[key] = Array.isArray(val) ? val[0] : val;
        }
        setFieldErrors(mapped);
      } else {
        setError("Signup failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: "full_name",     label: "Full Name",         type: "text",  placeholder: "John Doe",
      icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { name: "email",         label: "Email Address",     type: "email", placeholder: "admin@company.com",
      icon: "M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" },
    { name: "phone",         label: "Phone Number",      type: "text",  placeholder: "+91 98765 43210",
      icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" },
    { name: "organization",  label: "Organization Name", type: "text",  placeholder: "Acme Corp",
      icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  ];

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 py-10 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#00d9c0 1px,transparent 1px),linear-gradient(90deg,#00d9c0 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="w-full max-w-lg relative z-10">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 shadow-lg shadow-teal-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>HirePortal</h1>
          <p className="text-slate-400 text-sm mt-1">Create your admin account</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Get started</h2>
            <p className="text-slate-400 text-sm mt-1">Fill in your details to create an account</p>
          </div>

          {/* Global error */}
          {error && <ErrorBanner message={error} />}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.name} className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-300 mb-2">{f.label}</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={f.icon} />
                      </svg>
                    </span>
                    <input type={f.type} name={f.name} value={form[f.name]} onChange={handleChange}
                      required placeholder={f.placeholder}
                      className={`w-full bg-white/5 border ${fieldErrors[f.name] ? "border-red-500/60" : "border-white/10"} text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition-all`} />
                  </div>
                  {fieldErrors[f.name] && <FieldError msg={fieldErrors[f.name]} />}
                </div>
              ))}
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {["password", "confirmPassword"].map((key) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    {key === "password" ? "Password" : "Confirm Password"}
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </span>
                    <input type={showPassword ? "text" : "password"} name={key}
                      value={form[key]} onChange={handleChange} required placeholder="••••••••"
                      className={`w-full bg-white/5 border ${fieldErrors[key] ? "border-red-500/60" : "border-white/10"} text-white placeholder-slate-500 rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all`} />
                    {key === "confirmPassword" && (
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300 transition-colors">
                        <EyeIcon show={showPassword} />
                      </button>
                    )}
                  </div>
                  {/* Strength bar under password field */}
                  {key === "password" && form.password && (
                    <div className="mt-2">
                      <div className="flex gap-1 mb-1">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <div key={i} className="h-1 flex-1 rounded-full transition-all duration-300"
                            style={{ background: i <= strength ? STRENGTH_COLORS[strength] : "rgba(255,255,255,0.1)" }} />
                        ))}
                      </div>
                      <p className="text-xs" style={{ color: STRENGTH_COLORS[strength] }}>
                        {STRENGTH_LABELS[strength]}
                      </p>
                    </div>
                  )}
                  {fieldErrors[key] && <FieldError msg={fieldErrors[key]} />}
                </div>
              ))}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 text-sm mt-2">
              {loading
                ? <><Spinner />Creating account...</>
                : <>Create Account <ArrowIcon /></>}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already have an account?{" "}
            <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Sign in</Link>
          </p>
        </div>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}

// ── Tiny shared sub-components ────────────────────────────────────────────
function ErrorBanner({ message }) {
  return (
    <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
      <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <p className="text-red-400 text-sm">{message}</p>
    </div>
  );
}
function FieldError({ msg }) {
  return <p className="mt-1 text-xs text-red-400">{msg}</p>;
}
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}
function ArrowIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  );
}
function EyeIcon({ show }) {
  return show
    ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
    : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
}