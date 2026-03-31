import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { verifyLinkPassword } from "../api";
import styles from "./UnlockPage.module.css";

export default function UnlockPage() {
  const { id } = useParams();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await verifyLinkPassword(id, password);
      window.location.href = data.originalUrl;
    } catch (err) {
      setError(err.response?.data?.error || "Wrong password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.icon}>🔒</div>
        <h2 className={styles.title}>Password Protected Link</h2>
        <p className={styles.sub}>This link requires a password to access.</p>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoFocus
          />
          {error && <p className={styles.error}>⚠ {error}</p>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Verifying..." : "Unlock →"}
          </button>
        </form>
      </div>
    </div>
  );
}
