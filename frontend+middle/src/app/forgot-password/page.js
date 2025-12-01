"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "../signin/signin.module.css";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
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

    if (!form.email || !form.newPassword || !form.confirmPassword) {
      setError("All fields are required.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch("/api/user/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          newPassword: form.newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Password reset failed.");
      }

      setSuccess("Password updated! Redirecting to sign in...");
      setTimeout(() => router.push("/signin"), 1500);
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Password reset failed. Try again.");
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
            onChange={handleChange}
          />
          <input
            name="newPassword"
            type="password"
            placeholder="New Password"
            className={styles.input}
            onChange={handleChange}
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm New Password"
            className={styles.input}
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