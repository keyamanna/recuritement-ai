/**
 * src/App.jsx
 * ────────────
 * WHY THIS FILE IS MODIFIED:
 *   New routes added:
 *     /verify-email-sent  — shown after signup
 *     /verify-email       — landing page from email link (auto-verifies)
 *     /verify-phone       — phone OTP page
 *     /reset-password     — landing page from reset email link
 *
 *   ForgotPassword is now PUBLIC (not in PrivateRoute) and stays as before.
 *   ResetPassword replaces the old step-2 of ForgotPassword.
 *
 *   AIChat bot added — floats on every page bottom-right.
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login              from "./pages/Login";
import Signup             from "./pages/Signup";
import ForgotPassword     from "./pages/ForgotPassword";
import ResetPassword      from "./pages/ResetPassword";
import VerifyEmailSent    from "./pages/VerifyEmailSent";
import VerifyEmail        from "./pages/VerifyEmail";
import VerifyPhone        from "./pages/VerifyPhone";
import Dashboard          from "./pages/Dashboard";
import CreateJob          from "./pages/CreateJob";
import AllJobs            from "./pages/AllJobs";
import AIChat             from "./pages/AIChat";

// ── Guards ────────────────────────────────────────────────────────────────
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/dashboard" replace /> : children;
}

// ── App ───────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* ── Public (redirect to dashboard if already logged in) ── */}
        <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/signup"   element={<PublicRoute><Signup /></PublicRoute>} />

        {/* ── Verification flows (always public — no guard) ── */}
        <Route path="/verify-email-sent" element={<VerifyEmailSent />} />
        <Route path="/verify-email"      element={<VerifyEmail />} />
        <Route path="/verify-phone"      element={<VerifyPhone />} />

        {/* ── Password reset (always public) ── */}
        <Route path="/forgot-password"   element={<PublicRoute><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password"    element={<ResetPassword />} />

        {/* ── Protected ── */}
        <Route path="/dashboard"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/create-job" element={<PrivateRoute><CreateJob /></PrivateRoute>} />
        <Route path="/jobs"       element={<PrivateRoute><AllJobs /></PrivateRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>

      {/* ── AI Chatbot — floats on every page ── */}
      <AIChat />
    </BrowserRouter>
  );
}

// ── 404 ───────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl" />
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#00d9c0 1px,transparent 1px),linear-gradient(90deg,#00d9c0 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>
      <div className="text-center relative z-10">
        <p className="text-8xl font-bold bg-gradient-to-br from-teal-400 to-cyan-600 bg-clip-text text-transparent"
          style={{ fontFamily: "'Sora', sans-serif" }}>404</p>
        <h2 className="text-2xl font-semibold text-white mt-4 mb-2">Page Not Found</h2>
        <p className="text-slate-400 text-sm mb-8">The page you're looking for doesn't exist.</p>
        <a href="/dashboard"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white font-semibold px-6 py-3 rounded-xl shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all text-sm">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          Back to Dashboard
        </a>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}