/**
 * src/pages/VerifyEmailSent.jsx
 * ──────────────────────────────
 * WHY THIS FILE IS NEEDED (NEW):
 *   After signup the user is routed here instead of directly to the dashboard.
 *   Shows a friendly "check your inbox" screen and provides a resend button
 *   with a 60-second cooldown to prevent spam.
 */

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import api from "../utils/api";

export default function VerifyEmailSent() {
  const location    = useLocation();
  const email       = location.state?.email ?? "";
  const [cooldown, setCooldown]   = useState(0);   // seconds remaining
  const [status, setStatus]       = useState("");   // success / error message
  const [loading, setLoading]     = useState(false);

  // Tick the cooldown timer
  useEffect(() => {
    if (!cooldown) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const handleResend = async () => {
    if (!email) { setStatus("error:Cannot resend — email unknown."); return; }
    setLoading(true);
    setStatus("");
    try {
      await api.post("/auth/resend-verification/", { email });
      setStatus("ok:Verification email resent! Check your inbox.");
      setCooldown(60);
    } catch {
      setStatus("error:Failed to resend. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const [kind, msg] = status.startsWith("ok:")
    ? ["ok",    status.slice(3)]
    : status.startsWith("error:")
    ? ["error", status.slice(6)]
    : ["", ""];

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background blobs */}
      <Blobs />

      <div className="w-full max-w-md relative z-10 text-center">
        {/* Icon */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/15 border border-teal-500/30 mb-6">
          <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
          Check your inbox
        </h1>
        <p className="text-slate-400 text-sm mb-2">
          We sent a verification link to
        </p>
        {email && (
          <p className="text-teal-400 font-semibold text-sm mb-6 break-all">{email}</p>
        )}
        <p className="text-slate-500 text-xs mb-8 leading-relaxed">
          Click the link in the email to verify your account.<br />
          The link expires in <strong className="text-slate-400">24 hours</strong>.
        </p>

        {/* Status banner */}
        {kind === "ok" && (
          <div className="mb-4 flex items-start gap-3 bg-teal-500/10 border border-teal-500/30 rounded-xl px-4 py-3 text-left">
            <svg className="w-4 h-4 text-teal-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-teal-400 text-sm">{msg}</p>
          </div>
        )}
        {kind === "error" && (
          <div className="mb-4 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-left">
            <svg className="w-4 h-4 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{msg}</p>
          </div>
        )}

        {/* Resend button */}
        <button onClick={handleResend} disabled={loading || cooldown > 0}
          className="w-full bg-white/5 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed border border-white/10 text-white font-medium py-3 rounded-xl transition-all text-sm mb-4 flex items-center justify-center gap-2">
          {loading
            ? <><Spinner />Sending...</>
            : cooldown > 0
            ? `Resend in ${cooldown}s`
            : <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Resend verification email
              </>}
        </button>

        <p className="text-slate-500 text-sm">
          Already verified?{" "}
          <Link to="/login" className="text-teal-400 hover:text-teal-300 font-medium transition-colors">Sign in</Link>
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