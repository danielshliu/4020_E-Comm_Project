"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../signin/signin.module.css";

export default function ResetPasswordPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    resetCode: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.email || !form.resetCode || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/user/resetpassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          resetCode: form.resetCode,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Reset failed.");
      }

      setSuccess("Password reset! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err) {
      console.error("resetpassword error:", err);
      setError(err.message || "Reset failed. Try again.");
    }
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Reset Password</h1>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            name="email"
            type="email"
            placeholder="Email"
            className={styles.input}
            value={form.email}
            onChange={handleChange}
          />

          <input
            name="resetCode"
            type="text"
            placeholder="Reset code from email"
            className={styles.input}
            value={form.resetCode}
            onChange={handleChange}
          />

          <input
            name="newPassword"
            type="password"
            placeholder="New password"
            className={styles.input}
            value={form.newPassword}
            onChange={handleChange}
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            className={styles.input}
            value={form.confirmPassword}
            onChange={handleChange}
          />

          <button type="submit" className={styles.mainBtn}>
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
}
