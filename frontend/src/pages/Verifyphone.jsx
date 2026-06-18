/**
 * src/pages/VerifyPhone.jsx
 * ──────────────────────────
 * WHY THIS FILE IS NEEDED (NEW):
 *   Phone OTP verification page.  Accessible via:
 *     /verify-phone?email=<address>
 *   or via React Router state: { email }.
 *
 *   • 6 individual digit inputs for UX polish (auto-advance, paste support).
 *   • 5-attempt lockout handled gracefully.
 *   • Resend with 60-second cooldown.
 *   • OTP is sent to the user's email (simulated SMS).
 */

import { useState, useRef, useEffect } from "react";
import { useSearchParams, useLocation, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

export default function VerifyPhone() {
  const [params]   = useSearchParams();
  const location   = useLocation();
  const navigate   = useNavigate();

  const email = location.state?.email ?? params.get("email") ?? "";

  const [digits, setDigits]       = useState(Array(6).fill(""));
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const [success, setSuccess]     = useState("");
  const [cooldown, setCooldown]   = useState(0);
  const [sendLoading, setSendLoading] = useState(false);
  const inputRefs = useRef([]);

  // Send OTP on mount (first time)
  useEffect(() => {
    if (email) handleSendOTP();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const otp = digits.join("");

  // ── Digit input handlers ────────────────────────────────────────────
  const handleDigit = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...digits];
    next[i] = val;
    setDigits(next);
    setError("");
    if (val && i < 5) inputRefs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputRefs.current[i - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  // ── Send / Resend OTP ────────────────────────────────────────────────
  const handleSendOTP = async () => {
    if (!email) return;
    setSendLoading(true);
    setError("");
    try {
      await api.post("/auth/send-otp/", { email });
      setCooldown(60);
    } catch (err) {
      setError(err.response?.data?.error ?? "Failed to send OTP.");
    } finally {
      setSendLoading(false);
    }
  };

  // ── Verify OTP ───────────────────────────────────────────────────────
  const handleVerify = async () => {
    if (otp.length < 6) { setError("Enter all 6 digits."); return; }
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/auth/verify-otp/", { email, otp });
      setSuccess(res.data.message);
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(err.response?.data?.error ?? "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
      <Blobs />
      <div className="w-full max-w-md relative z-10">

        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-600 shadow-lg shadow-teal-500/30 mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white tracking-tight" style={{ fontFamily: "'Sora', sans-serif" }}>HirePortal</h1>
          <p className="text-slate-400 text-sm mt-1">Phone Verification</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl shadow-black/40">
          {success ? (
            /* ── Success state ── */
            <div className="text-center space-y-5 py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-teal-500/20 border border-teal-500/30">
                <svg className="w-8 h-8 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white">Phone Verified!</h2>
              <p className="text-slate-400 text-sm">{success}</p>
              <p className="text-slate-500 text-xs">Redirecting to login…</p>
            </div>
          ) : (
            /* ── OTP form ── */
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-white">Enter verification code</h2>
                <p className="text-slate-400 text-sm mt-1">
                  A 6-digit code was sent to{" "}
                  <span className="text-teal-400 font-medium">{email || "your email"}</span>
                  {" "}(simulated SMS).
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                  <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* 6-digit inputs */}
              <div className="flex gap-2 justify-center" onPaste={handlePaste}>
                {digits.map((d, i) => (
                  <input key={i} type="text" inputMode="numeric" maxLength={1}
                    ref={(el) => (inputRefs.current[i] = el)}
                    value={d}
                    onChange={(e) => handleDigit(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-11 h-14 text-center text-xl font-bold bg-white/5 border border-white/10 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/60 focus:border-teal-500/60 transition-all caret-teal-400" />
                ))}
              </div>

              {/* Verify button */}
              <button onClick={handleVerify} disabled={loading || otp.length < 6}
                className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-all text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-500/25">
                {loading ? <><Spinner />Verifying…</> : "Verify Phone"}
              </button>

              {/* Resend */}
              <div className="text-center">
                <p className="text-slate-500 text-sm">Didn't receive a code?</p>
                <button onClick={handleSendOTP}
                  disabled={sendLoading || cooldown > 0}
                  className="mt-1 text-teal-400 hover:text-teal-300 disabled:text-slate-600 text-sm font-medium transition-colors">
                  {sendLoading ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend code"}
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-600 mt-6">
          <Link to="/login" className="text-slate-500 hover:text-slate-400 transition-colors">← Back to login</Link>
        </p>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}

function Blobs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute inset-0 opacity-[0.03]"
        style={{ backgroundImage: "linear-gradient(#00d9c0 1px,transparent 1px),linear-gradient(90deg,#00d9c0 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
    </div>
  );
}
function Spinner() {
  return (
    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}