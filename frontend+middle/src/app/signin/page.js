"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./signin.module.css";

export default function SignInPage() {
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ============================
  // LOCAL STORAGE SIGN IN
  // ============================
  // function localLogin() {
  //   const users = JSON.parse(localStorage.getItem("ddj-users") || "[]");

  //   const found = users.find(
  //     (u) => u.username === username && u.password === password
  //   );

  //   if (!found) {
  //     setError("Incorrect username or password.");
  //     return;
  //   }

  //   sessionStorage.setItem("ddj-user", JSON.stringify(found));
  //   document.cookie = "ddj-user=logged; path=/;";
  //   router.push("/");
  // }

  // ============================
  // database version
  // ============================
  async function loginDB() {
    try {
      const res = await fetch("/api/controller/user/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      sessionStorage.setItem("ddj-user", JSON.stringify(data));
      document.cookie = "ddj-user=logged; path=/;";
      router.push("/");
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  }
  

  function adminLogin() {
    const admin = {
      user_id: 999,
      username: "Daniel",
      role: "admin",
    };

    sessionStorage.setItem("ddj-user", JSON.stringify(admin));
    document.cookie = "ddj-user=admin; path=/;";
    router.push("/");
  }

  function handleSubmit(e) {
    e.preventDefault();
    // localLogin();
    loginDB(); // replace with loginDB() later
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Welcome Back</h1>
        <p className={styles.subtitle}>Sign in to continue</p>

        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            className={styles.input}
            onChange={(e) => setUsername(e.target.value)}
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            className={styles.input}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className={styles.mainBtn}>
            Sign In
          </button>
        </form>

        <p className={styles.switch}>
          Don’t have an account? <a href="/signup">Create one</a>
        </p>

        <div className={styles.divider}>or</div>

        <button className={styles.adminBtn} onClick={adminLogin}>
          Sign in as Daniel (Admin)
        </button>
      </div>
    </div>
  );
}
