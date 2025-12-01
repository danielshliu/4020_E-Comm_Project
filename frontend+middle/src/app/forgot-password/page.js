"use client";

import { useState } from "react";
import styles from "../signin/signin.module.css";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setMsg("");

    if (!email) {
      setError("Email is required.");
      return;
    }

    try {
      const res = await fetch("/api/user/forgetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Could not send reset code.");
      }

      setMsg("Reset code sent! Check your email.");
    } catch (err) {
      console.error("forgetpassword error:", err);
      setError(err.message || "Could not send reset code.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Forgot Password</h1>

        {error && <p className={styles.error}>{error}</p>}
        {msg && <p className={styles.success}>{msg}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="email"
            placeholder="Enter your email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className={styles.mainBtn}>
            Send Reset Code
          </button>
        </form>

        <p className={styles.switch} style={{ marginTop: "1rem" }}>
          Already have a reset code? <a href="/reset-password">Enter it here</a>
        </p>
      </div>
    </div>
  );
}
