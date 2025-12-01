"use client";

import Image from "next/image";
import styles from "./about-us.module.css";

export default function AboutUsPage() {
  return (
    <div className={styles.wrapper}>
      {/*  hero */}
      <section className={styles.hero}>
        <Image
          src="https://images.unsplash.com/photo-1517430816045-df4b7de11d1d"
          alt="About Us Banner"
          fill
          className={styles.heroImage}
        />
        <div className={styles.heroText}>
          <h1>About DDJ Auctions</h1>
          <p>Your trusted destination for premium online auctions.</p>
        </div>
      </section>

      {/* our story */}
      <section className={styles.section}>
        <div className={styles.textBlock}>
          <h2>Our Story</h2>
          <p>
            DDJ Auctions was created to redefine the online auction experience.
            What began as a small passion project quickly transformed into a
            platform dedicated to transparency, fairness, and accessibility.  
          </p>
          <p>
            Our mission is to deliver a marketplace where buyers and sellers can
            connect effortlessly, confidently, and securely.
          </p>
        </div>

        <Image
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085"
          alt="Our Story"
          width={550}
          height={380}
          className={styles.sectionImage}
        />
      </section>

      {/* our vision */}
      <section className={`${styles.section} ${styles.reverse}`}>
        <Image
          src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
          alt="Our Vision"
          width={550}
          height={380}
          className={styles.sectionImage}
        />

        <div className={styles.textBlock}>
          <h2>Our Vision</h2>
          <p>
            We envision a future where online auctions are simple, intuitive,
            and enjoyable. A future where technology enhances trust and bridges
            communities together through seamless global commerce.
          </p>
          <p>
            Every feature we build — from secure payments to real-time bidding —
            is shaped with our users in mind.
          </p>
        </div>
      </section>

      {/* values */}
      <section className={styles.values}>
        <h2>What We Believe In</h2>

        <div className={styles.valuesGrid}>
          <div className={styles.valueCard}>
            <h3>Transparency</h3>
            <p>
              Clear pricing, honest auctions, and full visibility at every step.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3>Innovation</h3>
            <p>
              We continuously improve our platform to deliver the best possible
              online auction experience.
            </p>
          </div>

          <div className={styles.valueCard}>
            <h3>Community</h3>
            <p>
              Buyers and sellers come together in one trusted environment powered by technology.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
