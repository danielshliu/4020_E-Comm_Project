"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Auctions.module.css";

export default function Auctions() {
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Auctions</h2>
      <div className={styles.underline}></div>

      <div className={styles.grid}>
        {/* FORWARD AUCTIONS */}
        <Link href="/browse-auctions?type=forward" className={styles.card}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/forward.jpg"
              alt="Forward Auctions"
              width={520}
              height={320}
              className={styles.image}
            />
            <div className={styles.textOverlay}>Forward Auctions</div>
          </div>
        </Link>

        {/* DUTCH AUCTIONS */}
        <Link href="/browse-auctions?type=dutch" className={styles.card}>
          <div className={styles.imageWrapper}>
            <Image
              src="/images/dutch.jpg"
              alt="Dutch Auctions"
              width={520}
              height={320}
              className={styles.image}
            />
            <div className={styles.textOverlay}>Dutch Auctions</div>
          </div>
        </Link>
      </div>
    </section>
  );
}
