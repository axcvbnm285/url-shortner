import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { loginUser, registerUser } from "../api";
import styles from "./AuthPage.module.css";

export default function AuthPage() {
  const { login } = useAuth();
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const fn = mode === "login" ? loginUser : registerUser;
      const { data } = await fn({ username, password });
      login(data.token, data.username);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.brand}>✂️ Snip.ly</div>
        <p className={styles.tagline}>Smart URL Shortener with Analytics</p>

        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === "login" ? styles.active : ""}`}
            onClick={() => { setMode("login"); setError(""); }}
          >
            Log In
          </button>
          <button
            className={`${styles.tab} ${mode === "register" ? styles.active : ""}`}
            onClick={() => { setMode("register"); setError(""); }}
          >
            Register
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            className={styles.input}
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
          />
          <input
            className={styles.input}
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className={styles.error}>⚠ {error}</p>}
          <button className={styles.btn} type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Log In →" : "Create Account →"}
          </button>
        </form>

        <p className={styles.switch}>
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            className={styles.switchBtn}
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}
          >
            {mode === "login" ? "Register" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
