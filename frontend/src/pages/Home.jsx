import { useState, useEffect, useCallback } from "react";
import { internshipsAPI } from "../api/axios";
import InternshipCard from "../components/InternshipCard";
import toast from "react-hot-toast";

const SORTS = [
  { val: "newest",       label: "Newest first" },
  { val: "oldest",       label: "Oldest first" },
  { val: "stipend_high", label: "Stipend ↑" },
  { val: "stipend_low",  label: "Stipend ↓" },
];

const Home = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [pagination, setPagination]   = useState({ page: 1, pages: 1, total: 0 });
  const [filters, setFilters]         = useState({ search: "", location: "", type: "", skills: "", sort: "newest" });
  const [committed, setCommitted]     = useState(filters);

  const fetchInternships = useCallback(async (page = 1, f = committed) => {
    setLoading(true);
    try {
      const params = { page, limit: 9 };
      if (f.search)   params.search   = f.search;
      if (f.location) params.location = f.location;
      if (f.type)     params.type     = f.type;
      if (f.skills)   params.skills   = f.skills;
      if (f.sort)     params.sort     = f.sort;

      const res = await internshipsAPI.getAll(params);
      setInternships(res.data.data || []);
      const pg = res.data.pagination || {};
      setPagination({ page: pg.page || page, pages: pg.pages || 1, total: pg.total || 0 });
    } catch {
      toast.error("Failed to load internships");
    } finally {
      setLoading(false);
    }
  }, [committed]);

  useEffect(() => { fetchInternships(1, filters); }, []); // eslint-disable-line

  const handleSearch = (e) => {
    e.preventDefault();
    setCommitted(filters);
    fetchInternships(1, filters);
  };

  const handleClear = () => {
    const reset = { search: "", location: "", type: "", skills: "", sort: "newest" };
    setFilters(reset);
    setCommitted(reset);
    fetchInternships(1, reset);
  };

  const set = (k, v) => setFilters((f) => ({ ...f, [k]: v }));

  return (
    <div className="page">
      <div className="hero">
        <h1>Find Your Next Internship</h1>
        <p>Discover {pagination.total > 0 ? `${pagination.total}+` : ""} opportunities from top companies</p>
      </div>

      <form onSubmit={handleSearch} className="filter-bar">
        <input className="filter-search" placeholder="🔍 Search title, company..."
          value={filters.search} onChange={(e) => set("search", e.target.value)} />
        <input placeholder="📍 Location"
          value={filters.location} onChange={(e) => set("location", e.target.value)} />
        <input placeholder="🛠 Skills (comma-sep)"
          value={filters.skills} onChange={(e) => set("skills", e.target.value)} />
        <select value={filters.type} onChange={(e) => set("type", e.target.value)}>
          <option value="">All types</option>
          {["remote", "onsite", "hybrid"].map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <select value={filters.sort} onChange={(e) => set("sort", e.target.value)}>
          {SORTS.map((s) => <option key={s.val} value={s.val}>{s.label}</option>)}
        </select>
        <button type="submit" className="btn-primary">Search</button>
        <button type="button" className="btn-outline" onClick={handleClear}>Clear</button>
      </form>

      {loading ? (
        <div className="loading-grid">
          {[...Array(6)].map((_, i) => <div key={i} className="card skeleton" style={{ height: 180 }} />)}
        </div>
      ) : internships.length === 0 ? (
        <div className="empty-state"><p>No internships found. Try different filters.</p></div>
      ) : (
        <>
          <div className="grid">
            {internships.map((i) => <InternshipCard key={i._id} internship={i} />)}
          </div>
          <div className="pagination">
            <button className="btn-outline" disabled={pagination.page <= 1}
              onClick={() => fetchInternships(pagination.page - 1)}>← Prev</button>
            <span>Page {pagination.page} of {pagination.pages}</span>
            <button className="btn-outline" disabled={pagination.page >= pagination.pages}
              onClick={() => fetchInternships(pagination.page + 1)}>Next →</button>
          </div>
        </>
      )}
    </div>
  );
};

export default Home;