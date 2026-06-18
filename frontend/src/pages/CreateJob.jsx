import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Layout } from "./Dashboard";

export default function CreateJob() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [form, setForm] = useState({
    title: "",
    description: "",
    required_skills: "",
    experience_required: "",
    location: "",
    salary: "",
    job_type: "Full-Time",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    setError("");
    try {
      await axios.post("http://127.0.0.1:8000/api/jobs/create/", form, {
        headers: { Authorization: `Token ${token}` },
      });
      setSuccess(true);
      setTimeout(() => navigate("/jobs"), 1800);
    } catch (err) {
      const data = err.response?.data;
      if (data && typeof data === "object") {
        const key = Object.keys(data)[0];
        setError(`${key}: ${data[key]}`);
      } else {
        setError("Failed to create job. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Layout title="Post a Job">
        <div className="max-w-xl mx-auto mt-20 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-teal-500/20 border border-teal-500/30 mb-6">
            <svg className="w-10 h-10 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Sora', sans-serif" }}>Job Posted!</h2>
          <p className="text-slate-400">Your job listing is live. Redirecting to All Jobs…</p>
          <div className="mt-6 flex justify-center">
            <svg className="animate-spin w-6 h-6 text-teal-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Post a Job">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white" style={{ fontFamily: "'Sora', sans-serif" }}>Create a New Job Listing</h2>
          <p className="text-slate-400 text-sm mt-1">Fill in the details below to post a new opening.</p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            <svg className="w-5 h-5 text-red-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Card 1 — Basic Info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center text-xs font-bold">1</span>
              Basic Information
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Job Title <span className="text-red-400">*</span></label>
              <input type="text" name="title" value={form.title} onChange={handleChange} required
                placeholder="e.g. Senior Software Engineer"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Job Description <span className="text-red-400">*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} required rows={5}
                placeholder="Describe the role, responsibilities, and what you're looking for..."
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all resize-none" />
            </div>
          </div>

          {/* Card 2 — Skills & Experience */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-violet-500/20 text-violet-400 flex items-center justify-center text-xs font-bold">2</span>
              Skills & Experience
            </h3>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Required Skills <span className="text-red-400">*</span>
                <span className="text-slate-500 font-normal ml-1">(comma separated)</span>
              </label>
              <input type="text" name="required_skills" value={form.required_skills} onChange={handleChange} required
                placeholder="e.g. Python, Django, REST APIs, PostgreSQL"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all" />
              {/* Tag preview */}
              {form.required_skills && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {form.required_skills.split(",").map((s) => s.trim()).filter(Boolean).map((s, i) => (
                    <span key={i} className="text-xs bg-teal-500/15 text-teal-400 border border-teal-500/20 px-2.5 py-1 rounded-full">{s}</span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Experience Required <span className="text-red-400">*</span></label>
              <input type="text" name="experience_required" value={form.experience_required} onChange={handleChange} required
                placeholder="e.g. 2-3 years, Fresher, 5+ years"
                className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all" />
            </div>
          </div>

          {/* Card 3 — Location, Salary, Type */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
            <h3 className="text-white font-medium text-sm flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">3</span>
              Location & Compensation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Location <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </span>
                  <input type="text" name="location" value={form.location} onChange={handleChange} required
                    placeholder="e.g. Kolkata / Remote"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Salary / Package <span className="text-red-400">*</span></label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  <input type="text" name="salary" value={form.salary} onChange={handleChange} required
                    placeholder="e.g. ₹8-12 LPA"
                    className="w-full bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/60 transition-all" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Job Type <span className="text-red-400">*</span></label>
              <div className="flex gap-3 flex-wrap">
                {["Full-Time", "Part-Time", "Internship"].map((type) => {
                  const colors = { "Full-Time": "teal", "Part-Time": "amber", "Internship": "violet" };
                  const c = colors[type];
                  const active = form.job_type === type;
                  return (
                    <button type="button" key={type} onClick={() => setForm({ ...form, job_type: type })}
                      className={`px-5 py-2.5 rounded-xl text-sm font-medium border transition-all ${active
                        ? `bg-${c}-500/20 text-${c}-400 border-${c}-500/40`
                        : "bg-white/5 text-slate-400 border-white/10 hover:border-white/20 hover:text-white"}`}>
                      {type}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={() => navigate("/jobs")}
              className="px-5 py-2.5 text-sm font-medium text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="px-7 py-2.5 bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-400 hover:to-cyan-500 disabled:opacity-60 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-teal-500/25 hover:-translate-y-0.5 flex items-center gap-2 text-sm">
              {loading ? (
                <><svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Publishing...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Publish Job</>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}