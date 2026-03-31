import React, { useState } from "react";
import { deleteUrl } from "../api";
import { SHORTLINK_BASE_URL } from "../config";
import StatsModal from "./StatsModal";
import styles from "./Dashboard.module.css";

export default function Dashboard({ urls, onRefresh }) {
  const [selectedId, setSelectedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const BASE = SHORTLINK_BASE_URL;

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      await deleteUrl(id);
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  }

  function isExpired(expiresAt) {
    return expiresAt && new Date() > new Date(expiresAt);
  }

  if (!urls.length) {
    return (
      <div className={styles.empty}>
        <span>🔗</span>
        <p>No links yet. Shorten your first URL above!</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.wrapper}>
        <div className={styles.tableHeader}>
          <span>Original URL</span>
          <span>Short Link</span>
          <span>Clicks</span>
          <span>Created</span>
          <span>Status</span>
          <span></span>
        </div>

        {urls.map((u) => {
          const expired = isExpired(u.expiresAt);
          return (
            <div key={u._id} className={`${styles.row} ${expired ? styles.expired : ""}`}>
              <span className={styles.original} title={u.originalUrl}>
                {u.originalUrl.length > 45 ? u.originalUrl.slice(0, 45) + "…" : u.originalUrl}
              </span>

              <a
                href={`${BASE}/${u.shortCode}`}
                target="_blank"
                rel="noreferrer"
                className={styles.shortLink}
              >
                /{u.shortCode}
              </a>

              <span className={styles.clicks}>
                <span className={styles.clickBadge}>{u.clicks}</span>
              </span>

              <span className={styles.date}>
                {new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>

              <span>
                {expired ? (
                  <span className={styles.badge} style={{ background: "rgba(248,113,113,0.15)", color: "var(--danger)" }}>Expired</span>
                ) : u.expiresAt ? (
                  <span className={styles.badge} style={{ background: "rgba(251,191,36,0.15)", color: "var(--warning)" }}>
                    Exp {new Date(u.expiresAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </span>
                ) : (
                  <span className={styles.badge} style={{ background: "rgba(74,222,128,0.15)", color: "var(--success)" }}>Active</span>
                )}
              </span>

              <span className={styles.actions}>
                <button className={styles.statsBtn} onClick={() => setSelectedId(u._id)}>Stats</button>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDelete(u._id)}
                  disabled={deletingId === u._id}
                >
                  {deletingId === u._id ? "…" : "✕"}
                </button>
              </span>
            </div>
          );
        })}
      </div>

      {selectedId && <StatsModal urlId={selectedId} onClose={() => setSelectedId(null)} />}
    </>
  );
}
