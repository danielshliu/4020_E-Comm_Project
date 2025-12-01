"use client";

import Link from "next/link";
import styles from "./auth.module.css";

export default function AuthPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Welcome to DDJ Auctions</h1>

      <div className={styles.buttons}>
        <Link href="/signin" className={styles.btn}>
          Sign In
        </Link>

        <Link href="/signup" className={styles.btnOutline}>
          Sign Up
        </Link>
      </div>
    </div>
  );
}
