import React, { useState } from "react";
import { shortenUrl } from "../api";
import { SHORTLINK_BASE_URL } from "../config";
import styles from "./ShortenForm.module.css";

export default function ShortenForm({ onCreated }) {
  const [url, setUrl] = useState("");
  const [alias, setAlias] = useState("");
  const [expiryDays, setExpiryDays] = useState("");
  const [password, setPassword] = useState("");
  const [tags, setTags] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const shortLink = result ? `${SHORTLINK_BASE_URL}/${result.shortCode}` : "";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setResult(null);
    setLoading(true);
    try {
      const { data } = await shortenUrl({
        originalUrl: url,
        alias: alias.trim() || undefined,
        expiryDays: expiryDays ? Number(expiryDays) : undefined,
        password: password.trim() || undefined,
        tags: tags.trim() ? tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      });
      setResult(data);
      onCreated();
      setUrl(""); setAlias(""); setExpiryDays(""); setPassword(""); setTags("");
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    navigator.clipboard.writeText(shortLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <span className={styles.logo}>✂️ Snip.ly</span>
        <p className={styles.tagline}>Paste a long URL, get a clean short link — instantly.</p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <input
          className={styles.input}
          type="text"
          placeholder="https://your-very-long-url.com/goes/here"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />

        <button type="button" className={styles.advancedToggle} onClick={() => setShowAdvanced(!showAdvanced)}>
          {showAdvanced ? "▲ Hide options" : "▼ Advanced options"}
        </button>

        {showAdvanced && (
          <div className={styles.advanced}>
            <div className={styles.row}>
              <input
                className={styles.input}
                type="text"
                placeholder="Custom alias (optional)"
                value={alias}
                onChange={(e) => setAlias(e.target.value)}
              />
              <select className={styles.select} value={expiryDays} onChange={(e) => setExpiryDays(e.target.value)}>
                <option value="">No expiry</option>
                <option value="1">Expires in 1 day</option>
                <option value="7">Expires in 7 days</option>
                <option value="30">Expires in 30 days</option>
              </select>
            </div>
            <div className={styles.row}>
              <input
                className={styles.input}
                type="password"
                placeholder="🔒 Password protect (optional)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <input
                className={styles.input}
                type="text"
                placeholder="🏷 Tags: work, promo (optional)"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
              />
            </div>
          </div>
        )}

        <button className={styles.btn} type="submit" disabled={loading}>
          {loading ? "Shortening..." : "Shorten URL →"}
        </button>
      </form>

      {error && <p className={styles.error}>⚠ {error}</p>}

      {result && (
        <div className={styles.result}>
          <div className={styles.resultMeta}>
            {result.password && <span className={styles.badge}>🔒 Password protected</span>}
            {result.tags?.length > 0 && result.tags.map(t => (
              <span key={t} className={styles.tag}>#{t}</span>
            ))}
          </div>
          <div className={styles.resultRow}>
            <span className={styles.shortLink}>{shortLink}</span>
            <button className={styles.copyBtn} onClick={copy}>
              {copied ? "✓ Copied!" : "Copy"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
