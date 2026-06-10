
// import { useState, useEffect } from "react";
// import { internshipsAPI} from "../api/axios";
// import { useAuth } from "../context/AuthContext";
// import toast from "react-hot-toast";
// import InternshipForm from "../components/InternshipForm";
// import ApplicationsPanel from "../components/ApplicationsPanel";
// import StatsPanel from "../components/StatsPanel";


// // ─── Main Dashboard (Employer + Admin combined) ────────────────
// const EmployerDashboard = () => {
//   const { user }    = useAuth();
//   const isAdmin     = user?.role === "admin";

//   // tabs: employer sees "postings" only; admin sees "postings" + "admin"
//   const TABS = isAdmin ? ["postings", "admin"] : ["postings"];
//   const [tab, setTab]                           = useState("postings");
//   const [postings, setPostings]                 = useState([]);
//   const [loading, setLoading]                   = useState(true);
//   const [showForm, setShowForm]                 = useState(false);
//   const [editItem, setEditItem]                 = useState(null);
//   const [viewApps, setViewApps]                 = useState(null); // { _id, title }

//   const fetchPostings = async () => {
//     setLoading(true);
//     try {
//       const res = await internshipsAPI.myPostings(); // GET /internships/employer/my-postings
//       console.log("My postings:", res.data.data);
//       setPostings(res.data.data || []);
//     } catch {
//       toast.error("Failed to load postings");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchPostings(); }, []);

//   const handleDelete = async (id) => {
//     if (!window.confirm("Delete this posting?")) return;
//     try {
//       await internshipsAPI.remove(id);
//       toast.success("Deleted");
//       setPostings((p) => p.filter((x) => x._id !== id));
//     } catch { toast.error("Delete failed"); }
//   };

//   const openEdit = (p) => { setEditItem(p); setShowForm(false); setViewApps(null); };
//   const openCreate = () => { setShowForm(true); setEditItem(null); setViewApps(null); };
//   const closeForm  = () => { setShowForm(false); setEditItem(null); };

//   return (
//     <div className="page">
//       <div className="dashboard-header">
//         <h2 className="page-title">
//           {isAdmin ? "Admin Dashboard" : "Employer Dashboard"}
//         </h2>
//         {tab === "postings" && (
//           <span className="posting-count">
//             {postings.length} posting{postings.length !== 1 ? "s" : ""}
//           </span>
//         )}
//       </div>

//       {/* Tab bar (admin only sees two tabs) */}
//       {isAdmin && (
//         <div className="admin-tabs" style={{ marginBottom: "1.5rem" }}>
//           {TABS.map((t) => (
//             <button key={t} className={`admin-tab ${tab === t ? "active" : ""}`}
//               onClick={() => { setTab(t); closeForm(); setViewApps(null); }}>
//               {t === "postings" ? "📋 Postings" : "🛡 Admin Panel"}
//             </button>
//           ))}
//         </div>
//       )}

//       {/* ── Postings tab ── */}
//       {tab === "postings" && (
//         <>
//           {/* Form panel */}
//           {(showForm || editItem) ? (
//             <InternshipForm
//               initial={editItem}
//               onSaved={() => { closeForm(); fetchPostings(); }}
//               onCancel={closeForm}
//             />
//           ) : viewApps ? (
//             <ApplicationsPanel
//               internshipId={viewApps._id}
//               title={viewApps.title}
//               onBack={() => setViewApps(null)}
//             />
//           ) : (
//             <div className="section">
//               <h3>Your Postings</h3>
//               {loading ? (
//                 <div>{[1,2,3].map((i) => <div key={i} className="posting-item skeleton" style={{ height: 72, marginBottom: 8 }} />)}</div>
//               ) : postings.length === 0 ? (
//                 <div className="empty-state">
//                   <p>No postings yet. Hit + to create your first internship.</p>
//                 </div>
//               ) : (
//                 <div className="postings-list">
//                   {postings.map((p) => (
//                     <div key={p._id} className="posting-item">
//                       <div className="posting-info">
//                         <strong>{p.title}</strong>
//                         <span>{p.companyName} · {p.location} · <em>{p.type}</em></span>
//                         <span className="app-count">
//                           {p.applicationsCount ?? p.applications?.length ?? 0} application(s)
//                         </span>
//                       </div>
//                       <div className="posting-actions">
//                         <button className="btn-outline btn-sm" onClick={() => setViewApps(p)}>
//                           Applications
//                         </button>
//                         <button className="btn-outline btn-sm" onClick={() => openEdit(p)}>
//                           Edit
//                         </button>
//                         <button className="btn-danger btn-sm" onClick={() => handleDelete(p._id)}>
//                           Delete
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           )}

//           {/* FAB — only when list is visible */}
//           {!showForm && !editItem && !viewApps && (
//             <button className="fab" title="Post new internship" onClick={openCreate}>+</button>
//           )}
//         </>
//       )}

//       {/* ── Admin tab ── */}
//       {tab === "admin" && isAdmin && <StatsPanel />}
//     </div>
//   );
// };

// export default EmployerDashboard;




import { useState, useEffect } from "react";
import { internshipsAPI } from "../api/axios";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import InternshipForm from "../components/InternshipForm";
import ApplicationsPanel from "../components/ApplicationsPanel";
import StatsPanel from "../components/StatsPanel";

// ─── Main Dashboard (Employer + Admin combined) ────────────────
const EmployerDashboard = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const TABS = isAdmin ? ["postings", "admin"] : ["postings"];

  const [tab, setTab] = useState("postings");
  const [postings, setPostings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [viewApps, setViewApps] = useState(null);

  // Fetch postings with pagination
  const fetchPostings = async (pageNum = 1, append = false) => {
    try {
      if (pageNum === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await internshipsAPI.myPostings({
        page: pageNum,
        limit: 10,
      });

      console.log("My postings:", res.data);

      const newData = res.data.data || [];
      // if(postings.length > 0 && newData.length > 0) {
      //   append=true;
      // }

      if (append) {
        setPostings((prev) => [...prev, ...newData]);
      } else {
        setPostings(newData);
      }

      setHasNext(res.data.meta?.hasNext || false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load postings");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchPostings(1);
  }, []);

  const loadMore = async () => {
    const nextPage = page + 1;

    await fetchPostings(nextPage, true);

    setPage(nextPage);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this posting?")) return;

    try {
      await internshipsAPI.remove(id);

      toast.success("Deleted");

      setPostings((prev) =>
        prev.filter((item) => item._id !== id)
      );
    } catch {
      toast.error("Delete failed");
    }
  };

  const openEdit = (posting) => {
    setEditItem(posting);
    setShowForm(false);
    setViewApps(null);
  };

  const openCreate = () => {
    setShowForm(true);
    setEditItem(null);
    setViewApps(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditItem(null);
  };

  const refreshPostings = () => {
    closeForm();
    setPage(1);
    fetchPostings(1);
  };

  return (
    <div className="page">
      <div className="dashboard-header">
        <h2 className="page-title">
          {isAdmin ? "Admin Dashboard" : "Employer Dashboard"}
        </h2>

        {tab === "postings" && (
          <span className="posting-count">
            {postings.length} posting
            {postings.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Admin Tabs */}
      {isAdmin && (
        <div
          className="admin-tabs"
          style={{ marginBottom: "1.5rem" }}
        >
          {TABS.map((t) => (
            <button
              key={t}
              className={`admin-tab ${
                tab === t ? "active" : ""
              }`}
              onClick={() => {
                setTab(t);
                closeForm();
                setViewApps(null);
              }}
            >
              {t === "postings"
                ? "📋 Postings"
                : "🛡 Admin Panel"}
            </button>
          ))}
        </div>
      )}

      {/* ───────────── POSTINGS TAB ───────────── */}
      {tab === "postings" && (
        <>
          {(showForm || editItem) ? (
            <InternshipForm
              initial={editItem}
              onSaved={refreshPostings}
              onCancel={closeForm}
            />
          ) : viewApps ? (
            <ApplicationsPanel
              internshipId={viewApps._id}
              title={viewApps.title}
              onBack={() => setViewApps(null)}
            />
          ) : (
            <div className="section">
              <h3>Your Postings</h3>

              {loading ? (
                <div>
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="posting-item skeleton"
                      style={{
                        height: 72,
                        marginBottom: 8,
                      }}
                    />
                  ))}
                </div>
              ) : postings.length === 0 ? (
                <div className="empty-state">
                  <p>
                    No postings yet. Hit + to create your
                    first internship.
                  </p>
                </div>
              ) : (
                <>
                  <div className="postings-list">
                    {postings.map((p) => (
                      <div
                        key={p._id}
                        className="posting-item"
                      >
                        <div className="posting-info">
                          <strong>{p.title}</strong>

                          <span>
                            {p.companyName} · {p.location} ·{" "}
                            <em>{p.type}</em>
                          </span>

                          <span className="app-count">
                            {p.applicationsCount || 0}{" "}
                            application(s)
                          </span>
                        </div>

                        <div className="posting-actions">
                          <button
                            className="btn-outline btn-sm"
                            onClick={() => setViewApps(p)}
                          >
                            Applications
                          </button>

                          <button
                            className="btn-outline btn-sm"
                            onClick={() => openEdit(p)}
                          >
                            Edit
                          </button>

                          <button
                            className="btn-danger btn-sm"
                            onClick={() =>
                              handleDelete(p._id)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Load More */}
                  {hasNext && (
                    <div
                      style={{
                        textAlign: "center",
                        marginTop: "1.5rem",
                      }}
                    >
                      <button
                        className="btn-outline"
                        onClick={loadMore}
                        disabled={loadingMore}
                      >
                        {loadingMore
                          ? "Loading..."
                          : "Load More"}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {/* Floating Action Button */}
          {!showForm && !editItem && !viewApps && (
            <button
              className="fab"
              title="Post new internship"
              onClick={openCreate}
            >
              +
            </button>
          )}
        </>
      )}

      {/* ───────────── ADMIN TAB ───────────── */}
      {tab === "admin" && isAdmin && <StatsPanel />}
    </div>
  );
};

export default EmployerDashboard;