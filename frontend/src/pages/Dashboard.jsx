import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

// ── Sidebar ──────────────────────────────────────────────
function Sidebar({ open, onClose }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const nav = [
    { to: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
    { to: "/jobs", label: "All Jobs", icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" },
    { to: "/create-job", label: "Post a Job", icon: "M12 4v16m8-8H4" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    navigate("/login");
  };

  const admin = JSON.parse(localStorage.getItem("admin") || "{}");

  return (
    <>
      {/* Overlay */}
      {open && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={onClose} />}

      <aside className={`fixed top-0 left-0 h-full w-64 bg-[#0d1526] border-r border-white/10 z-30 flex flex-col transition-transform duration-300 ${open ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}>
        {/* Brand */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/30 shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-white font-bold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>HirePortal</p>
              <p className="text-slate-500 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {nav.map((n) => {
            const active = pathname === n.to;
            return (
              <Link key={n.to} to={n.to} onClick={onClose}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? "bg-teal-500/20 text-teal-400 border border-teal-500/30" : "text-slate-400 hover:text-white hover:bg-white/5"}`}>
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={n.icon} />
                </svg>
                {n.label}
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400" />}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {admin.full_name?.[0]?.toUpperCase() || "A"}
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-medium truncate">{admin.full_name || "Admin"}</p>
              <p className="text-slate-500 text-xs truncate">{admin.organization || ""}</p>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ── Topbar ───────────────────────────────────────────────
function Topbar({ title, onMenuClick }) {
  return (
    <header className="h-16 border-b border-white/10 bg-[#0a0f1e]/80 backdrop-blur sticky top-0 z-10 flex items-center px-6 gap-4">
      <button onClick={onMenuClick} className="lg:hidden text-slate-400 hover:text-white transition-colors">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="text-white font-semibold text-lg" style={{ fontFamily: "'Sora', sans-serif" }}>{title}</h1>
    </header>
  );
}

// ── Layout ───────────────────────────────────────────────
export function Layout({ children, title }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen bg-[#0a0f1e] lg:pl-64">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex flex-col min-h-screen">
        <Topbar title={title} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 p-6">{children}</main>
      </div>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700&display=swap');`}</style>
    </div>
  );
}

// ── Dashboard Page ────────────────────────────────────────
export default function Dashboard() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const admin = JSON.parse(localStorage.getItem("admin") || "{}");
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    axios.get("http://127.0.0.1:8000/api/jobs/my-jobs/", {
      headers: { Authorization: `Token ${token}` },
    }).then((res) => setJobs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const stats = [
    { label: "Total Jobs Posted", value: jobs.length, icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", color: "from-teal-500 to-cyan-600" },
    { label: "Full-Time", value: jobs.filter((j) => j.job_type === "Full-Time").length, icon: "M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z", color: "from-violet-500 to-purple-600" },
    { label: "Part-Time", value: jobs.filter((j) => j.job_type === "Part-Time").length, icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-amber-500 to-orange-500" },
    { label: "Internships", value: jobs.filter((j) => j.job_type === "Internship").length, icon: "M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z", color: "from-rose-500 to-pink-600" },
  ];

  return (
    <Layout title="Dashboard">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-500/20 to-cyan-600/10 border border-teal-500/20 rounded-2xl p-6 mb-8 relative overflow-hidden">
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-24 h-24 bg-teal-500/10 rounded-full blur-2xl" />
        <p className="text-slate-400 text-sm mb-1">Good day,</p>
        <h2 className="text-2xl font-bold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>
          {admin.full_name || "Admin"} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">{admin.organization} · Manage your job postings below</p>
        <Link to="/create-job"
          className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Post a New Job
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/8 transition-all">
            <div className={`inline-flex w-10 h-10 items-center justify-center rounded-xl bg-gradient-to-br ${s.color} mb-3 shadow-lg`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={s.icon} />
              </svg>
            </div>
            <p className="text-3xl font-bold text-white">{loading ? "—" : s.value}</p>
            <p className="text-slate-400 text-xs mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Jobs */}
      <div className="bg-white/5 border border-white/10 rounded-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-white font-semibold text-sm" style={{ fontFamily: "'Sora', sans-serif" }}>Recent Job Postings</h3>
          <Link to="/jobs" className="text-teal-400 text-xs hover:text-teal-300 transition-colors">View All →</Link>
        </div>
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <svg className="animate-spin w-8 h-8 text-teal-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
              <svg className="w-7 h-7 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-slate-400 text-sm">No jobs posted yet.</p>
            <Link to="/create-job" className="text-teal-400 text-sm hover:text-teal-300 mt-1 inline-block">Post your first job →</Link>
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {jobs.slice(0, 5).map((job) => (
              <div key={job.id} className="flex items-center gap-4 px-6 py-4 hover:bg-white/5 transition-all">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border border-teal-500/20 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{job.title}</p>
                  <p className="text-slate-500 text-xs truncate">{job.location} · {job.salary}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${job.job_type === "Full-Time" ? "bg-teal-500/20 text-teal-400" : job.job_type === "Part-Time" ? "bg-amber-500/20 text-amber-400" : "bg-violet-500/20 text-violet-400"}`}>
                  {job.job_type}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}