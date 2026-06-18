/**
 * src/pages/VerifyEmail.jsx
 * ──────────────────────────
 * WHY THIS FILE IS NEEDED (NEW):
 *   This is the page the user lands on when they click the link in their
 *   verification email.  URL format:
 *     /verify-email?token=<raw>&email=<address>
 *
 *   On mount it auto-calls the backend.  Shows success / error state.
 *   If REQUIRE_PHONE_OTP is enabled the backend returns next:"phone_verification"
 *   and we route to /verify-phone instead of /login.
 */

import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import api from "../utils/api";

export default function VerifyEmail() {
  const [params]   = useSearchParams();
  const navigate   = useNavigate();
  const token      = params.get("token") ?? "";
  const email      = params.get("email") ?? "";

  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");
  const [next, setNext]       = useState("login");

  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setMessage("This link is invalid. Please request a new verification email.");
      return;
    }

    api.post("/auth/verify-email/", { token, email })
      .then((res) => {
        setStatus("success");
        setMessage(res.data.message);
        setNext(res.data.next ?? "login");
        // Auto-redirect after 3 seconds
        setTimeout(() => {
          if (res.data.next === "phone_verification") {
            navigate("/verify-phone", { state: { email } });
          } else {
            navigate("/login");
          }
        }, 3000);
      })
      .catch((err) => {
        setStatus("error");
        setMessage(err.response?.data?.error ?? "Verification failed. The link may have expired.");
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
      <Blobs />
      <div className="w-full max-w-md relative z-10 text-center">

        {/* Loading */}
        {status === "loading" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/10 border border-teal-500/20 mb-6">
              <svg className="animate-spin w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              Verifying your email…
            </h2>
            <p className="text-slate-400 text-sm">This will only take a moment.</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/15 border border-teal-500/30 mb-6">
              <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              Email Verified!
            </h2>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <p className="text-slate-500 text-xs mb-6">Redirecting you automatically…</p>
            <Link
              to={next === "phone_verification" ? `/verify-phone?email=${encodeURIComponent(email)}` : "/login"}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all text-sm">
              {next === "phone_verification" ? "Verify Phone →" : "Go to Login →"}
            </Link>
          </>
        )}

        {/* Error */}
        {status === "error" && (
          <>
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/15 border border-red-500/30 mb-6">
              <svg className="w-10 h-10 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-semibold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>
              Verification Failed
            </h2>
            <p className="text-slate-400 text-sm mb-6">{message}</p>
            <Link to="/verify-email-sent"
              className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium px-6 py-3 rounded-xl transition-all text-sm">
              Request a new link
            </Link>
          </>
        )}

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