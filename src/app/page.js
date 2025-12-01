"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import Hero from "../components/Hero";
import Auctions from "../components/Auctions";
import HowItWorks from "../components/HowItWorks";
import Welcome from "../components/Welcome";

import styles from "./Home.module.css";

export default function HomePage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const user = sessionStorage.getItem("ddj-user");

    if (!user) {
      router.push("/signin");
    } else {
      setCheckingAuth(false);
    }
  }, [router]);

  if (checkingAuth) return <div></div>;

  return (
    <div className={styles.page}>
    
      <section className={styles.heroSection}>
        <Hero />
      </section>

      {/* Spaced luxury-style sections */}
      <section className={styles.section}>
        <Auctions />
      </section>

      <section className={styles.section}>
        <HowItWorks />
      </section>

      <section className={styles.section}>
        <Welcome />
      </section>
    </div>
  );
}
