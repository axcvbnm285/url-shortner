import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ShortenForm from "./components/ShortenForm";
import BulkShorten from "./components/BulkShorten";
import Dashboard from "./components/Dashboard";
import { fetchUrls } from "./api";
import styles from "./App.module.css";

export default function App() {
  const { token, username, logout } = useAuth();
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("home"); // "home" | "bulk" | "dashboard"
  const [search, setSearch] = useState("");
  const [tagFilter, setTagFilter] = useState("");

  const allTags = [...new Set(urls.flatMap((u) => u.tags || []))];

  const loadUrls = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await fetchUrls(params);
      setUrls(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) loadUrls();
  }, [token, loadUrls]);

  function applyFilters() {
    const params = {};
    if (search.trim()) params.search = search.trim();
    if (tagFilter) params.tag = tagFilter;
    loadUrls(params);
  }

  useEffect(() => {
    if (token) applyFilters();
  }, [search, tagFilter]);

  if (!token) return <AuthPage />;

  const totalClicks = urls.reduce((sum, u) => sum + u.clicks, 0);
  const activeLinks = urls.filter((u) => !u.expiresAt || new Date() < new Date(u.expiresAt)).length;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.brandArea}>
            <h1 className={styles.brand}>✂️ Snip.ly</h1>
            <p className={styles.sub}>Smart URL Shortener</p>
          </div>

          <nav className={styles.nav}>
            <button className={`${styles.navBtn} ${view === "home" ? styles.navActive : ""}`} onClick={() => setView("home")}>
              🏠 Home
            </button>
            <button className={`${styles.navBtn} ${view === "bulk" ? styles.navActive : ""}`} onClick={() => setView("bulk")}>
              ⚡ Bulk
            </button>
            <button className={`${styles.navBtn} ${view === "dashboard" ? styles.navActive : ""}`} onClick={() => { setView("dashboard"); loadUrls(); }}>
              📊 Dashboard
            </button>
          </nav>

          <div className={styles.userArea}>
            <span className={styles.userBadge}>👤 {username}</span>
            <button className={styles.logoutBtn} onClick={logout}>Log Out</button>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        {view === "home" && (
          <div className={styles.homeView}>
            <div className={styles.hero}>
              <h2 className={styles.heroTitle}>Shorten. Share. Track.</h2>
              <p className={styles.heroSub}>Paste a long URL and get a clean short link with full analytics.</p>
            </div>
            <ShortenForm onCreated={() => loadUrls()} />
            {urls.length > 0 && (
              <div className={styles.recentHint}>
                You have <strong>{urls.length}</strong> link{urls.length !== 1 ? "s" : ""} with <strong>{totalClicks}</strong> total click{totalClicks !== 1 ? "s" : ""}.{" "}
                <button className={styles.hintLink} onClick={() => setView("dashboard")}>View Dashboard →</button>
              </div>
            )}
          </div>
        )}

        {view === "bulk" && (
          <div className={styles.homeView}>
            <div className={styles.hero}>
              <h2 className={styles.heroTitle}>Bulk Shorten</h2>
              <p className={styles.heroSub}>Shorten up to 20 URLs at once — paste one per line.</p>
            </div>
            <BulkShorten onCreated={() => loadUrls()} />
          </div>
        )}

        {view === "dashboard" && (
          <div className={styles.dashView}>
            <div className={styles.dashHeader}>
              <div>
                <h2 className={styles.dashTitle}>Your Dashboard</h2>
                <p className={styles.dashSub}>All your shortened links and their performance.</p>
              </div>
              <div className={styles.dashStats}>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{urls.length}</span>
                  <span className={styles.statLabel}>Total Links</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{totalClicks}</span>
                  <span className={styles.statLabel}>Total Clicks</span>
                </div>
                <div className={styles.statCard}>
                  <span className={styles.statNum}>{activeLinks}</span>
                  <span className={styles.statLabel}>Active</span>
                </div>
              </div>
            </div>

            {/* Search + filter bar */}
            <div className={styles.filterBar}>
              <input
                className={styles.searchInput}
                type="text"
                placeholder="🔍 Search URLs or short codes..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {allTags.length > 0 && (
                <select className={styles.tagSelect} value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
                  <option value="">All tags</option>
                  {allTags.map((t) => <option key={t} value={t}>#{t}</option>)}
                </select>
              )}
              <button className={styles.refreshBtn} onClick={() => { setSearch(""); setTagFilter(""); loadUrls(); }}>↻</button>
              <button className={styles.newLinkBtn} onClick={() => setView("home")}>+ New Link</button>
            </div>

            {loading ? (
              <p className={styles.loading}>Loading your links...</p>
            ) : (
              <Dashboard urls={urls} onRefresh={() => loadUrls()} />
            )}
          </div>
        )}
      </main>

      <footer className={styles.footer}>
        Built with Node.js · Express · MongoDB · React
      </footer>
    </div>
  );
}
