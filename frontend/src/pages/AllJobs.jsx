import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "./Dashboard";

export default function AllJobs() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("All");
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!token) { navigate("/login"); return; }
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/jobs/my-jobs/", {
        headers: { Authorization: `Token ${token}` },
      });
      setJobs(res.data);
    } catch {
      showToast("Failed to load jobs.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this job?")) return;
    setDeleting(id);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/jobs/delete/${id}/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setJobs((prev) => prev.filter((j) => j.id !== id));
      showToast("Job deleted successfully.", "success");
    } catch {
      showToast("Failed to delete job.", "error");
    } finally {
      setDeleting(null);
    }
  };

  const showToast = (msg, type) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const typeColors = {
    "Full-Time": { bg: "bg-teal-500/20", text: "text-teal-400", border: "border-teal-500/30" },
    "Part-Time": { bg: "bg-amber-500/20", text: "text-amber-400", border: "border-amber-500/30" },
    "Internship": { bg: "bg-violet-500/20", text: "text-violet-400", border: "border-violet-500/30" },
  };

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase()) ||
      j.required_skills.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "All" || j.job_type === filterType;
    return matchSearch && matchType;
  });

  return (
    <Layout title="All Jobs">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-xl transition-all ${toast.type === "success" ? "bg-teal-500/20 border-teal-500/30 text-teal-400" : "bg-red-500/20 border-red-500/30 text-red-400"}`}>
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={toast.type === "success" ? "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" : "M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"} />
          </svg>
          {toast.msg}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, location, or skills..."
            className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all" />
        </div>

        {/* Filter */}
        <div className="flex gap-2">
          {["All", "Full-Time", "Part-Time", "Internship"].map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-all whitespace-nowrap ${filterType === t ? "bg-teal-500/20 text-teal-400 border-teal-500/30" : "bg-white/5 text-slate-400 border-white/10 hover:text-white hover:border-white/20"}`}>
              {t}
            </button>
          ))}
        </div>

        <Link to="/create-job"
          className="flex items-center gap-2 bg-gradient-to-r from-teal-500 to-cyan-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 transition-all whitespace-nowrap">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Post Job
        </Link>
      </div>

      {/* Results count */}
      {!loading && (
        <p className="text-slate-500 text-xs mb-4">
          Showing <span className="text-slate-300 font-medium">{filtered.length}</span> of <span className="text-slate-300 font-medium">{jobs.length}</span> jobs
        </p>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <svg className="animate-spin w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-white font-medium">No jobs found</p>
          <p className="text-slate-500 text-sm mt-1">Try adjusting your search or filters.</p>
          <Link to="/create-job" className="mt-4 inline-flex items-center gap-2 text-teal-400 hover:text-teal-300 text-sm transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Post your first job
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((job) => {
            const tc = typeColors[job.job_type] || typeColors["Full-Time"];
            const skills = job.required_skills.split(",").map((s) => s.trim()).filter(Boolean);
            return (
              <div key={job.id} className="group bg-white/5 hover:bg-white/8 border border-white/10 hover:border-white/20 rounded-2xl p-5 transition-all duration-200 flex flex-col gap-4">
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500/20 to-cyan-600/20 border border-teal-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-5 h-5 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm leading-tight">{job.title}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${tc.bg} ${tc.text} ${tc.border}`}>{job.job_type}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Meta */}
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { icon: "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z", val: job.location },
                    { icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", val: job.salary },
                    { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", val: job.experience_required },
                  ].map((m, i) => (
                    <div key={i} className={`flex items-center gap-2 ${i === 2 ? "col-span-2" : ""}`}>
                      <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={m.icon} />
                      </svg>
                      <span className="text-slate-400 text-xs truncate">{m.val}</span>
                    </div>
                  ))}
                </div>

                {/* Skills */}
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 4).map((s, i) => (
                    <span key={i} className="text-xs bg-white/5 text-slate-400 border border-white/10 px-2 py-0.5 rounded-full">{s}</span>
                  ))}
                  {skills.length > 4 && (
                    <span className="text-xs bg-white/5 text-slate-500 border border-white/10 px-2 py-0.5 rounded-full">+{skills.length - 4} more</span>
                  )}
                </div>

                {/* Description snippet */}
                <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">{job.description}</p>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-1 border-t border-white/5">
                  <Link to={`/edit-job/${job.id}`}
                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-2 rounded-lg transition-all">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(job.id)} disabled={deleting === job.id}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-2 rounded-lg transition-all disabled:opacity-50">
                    {deleting === job.id ? (
                      <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                    ) : (
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                    {deleting === job.id ? "Deleting..." : "Delete"}
                  </button>
                  <span className="ml-auto text-xs text-slate-600">
                    {new Date(job.created_at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Layout>
  );
}