import React, { useState } from "react";
import { bulkShortenUrls } from "../api";
import { SHORTLINK_BASE_URL } from "../config";
import styles from "./BulkShorten.module.css";

export default function BulkShorten({ onCreated }) {
  const [text, setText] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const BASE = SHORTLINK_BASE_URL;

  async function handleSubmit(e) {
    e.preventDefault();
    const urls = text.split("\n").map((u) => u.trim()).filter(Boolean);
    if (!urls.length) return;
    setError("");
    setLoading(true);
    try {
      const { data } = await bulkShortenUrls(urls);
      setResults(data);
      onCreated();
      setText("");
    } catch (err) {
      setError(err.response?.data?.error || "Bulk shorten failed.");
    } finally {
      setLoading(false);
    }
  }

  function copyAll() {
    const lines = results
      .filter((r) => !r.error)
      .map((r) => `${r.originalUrl} → ${BASE}/${r.shortCode}`)
      .join("\n");
    navigator.clipboard.writeText(lines);
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.title}>⚡ Bulk Shorten</span>
        <span className={styles.sub}>Paste up to 20 URLs, one per line</span>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <textarea
          className={styles.textarea}
          placeholder={"https://example.com/page-one\nhttps://example.com/page-two\nhttps://example.com/page-three"}
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={5}
          required
        />
        {error && <p className={styles.error}>⚠ {error}</p>}
        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? "Processing..." : `Shorten ${text.split("\n").filter((l) => l.trim()).length || ""} URLs →`}
        </button>
      </form>

      {results.length > 0 && (
        <div className={styles.results}>
          <div className={styles.resultsHeader}>
            <span className={styles.resultsTitle}>Results ({results.filter((r) => !r.error).length} shortened)</span>
            <button className={styles.copyAllBtn} onClick={copyAll}>Copy All</button>
          </div>
          {results.map((r, i) => (
            <div key={i} className={`${styles.resultRow} ${r.error ? styles.errRow : ""}`}>
              <span className={styles.original} title={r.originalUrl}>
                {r.originalUrl.length > 40 ? r.originalUrl.slice(0, 40) + "…" : r.originalUrl}
              </span>
              {r.error ? (
                <span className={styles.errBadge}>{r.error}</span>
              ) : (
                <a href={`${BASE}/${r.shortCode}`} target="_blank" rel="noreferrer" className={styles.shortLink}>
                  {BASE}/{r.shortCode}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
