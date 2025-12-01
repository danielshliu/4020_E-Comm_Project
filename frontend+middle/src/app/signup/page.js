"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./signup.module.css";

export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    street: "",
    number: "",
    city: "",
    country: "",
    postal: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // ============================
  // LOCAL SIGNUP
  // ============================
  // function localSignup() {
  //   const users = JSON.parse(localStorage.getItem("ddj-users") || "[]");

  //   if (users.some((u) => u.username === form.username)) {
  //     setError("Username already exists.");
  //     return;
  //   }

  //   if (users.some((u) => u.email === form.email)) {
  //     setError("Email already registered.");
  //     return;
  //   }

  //   const newUser = {
  //     user_id: Date.now(),
  //     ...form,
  //     address: `${form.street} ${form.number}, ${form.city}, ${form.country}, ${form.postal}`,
  //     role: "user",
  //   };

  //   users.push(newUser);
  //   localStorage.setItem("ddj-users", JSON.stringify(users));

  //   setSuccess("Account created! Redirecting...");
  //   setTimeout(() => router.push("/signin"), 1200);
  // }

  // ============================
  // Database version (RESTORED)
  // ============================
  
  async function signupDB() {
    try {
      const res = await fetch("/api/controller/user/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      setSuccess("Account created! Redirecting...");
      setTimeout(() => router.push("/signin"), 1200);
    } catch (err) {
      console.error('Signup error:', err);
      setError(err.message || "Signup failed. Try again.");
    }
  }


  function handleSubmit(e) {
    e.preventDefault();
    // localSignup();
    signupDB(); // swap with signupDB() when ready
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>

        {error && <p className={styles.error}>{error}</p>}
        {success && <p className={styles.success}>{success}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <input name="username" placeholder="Username" onChange={handleChange} />
          <input name="password" placeholder="Password" type="password" onChange={handleChange} />
          <input name="email" placeholder="Email Address" type="email" onChange={handleChange} />

          <input name="firstName" placeholder="First Name" onChange={handleChange} />
          <input name="lastName" placeholder="Last Name" onChange={handleChange} />

          <input name="street" placeholder="Street Name" onChange={handleChange} />
          <input name="number" placeholder="Unit Number" onChange={handleChange} />
          <input name="city" placeholder="City" onChange={handleChange} />
          <input name="country" placeholder="Country" onChange={handleChange} />
          <input name="postal" placeholder="Postal Code" onChange={handleChange} />

          <button type="submit" className={styles.mainBtn}>Create Account</button>
        </form>

        <p className={styles.switch}>
          Already have an account? <a href="/signin">Sign In</a>
        </p>
      </div>
    </div>
  );
}
