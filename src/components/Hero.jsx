// components/Hero.jsx
import Image from "next/image";
import styles from "../styles/Hero.module.css";

export default function Hero() {
  return (
    <section className={styles.hero}>
      <Image
        src="/images/auctionplaced.jpg"
        alt="Auction Banner"
        fill
        priority
        className={styles.heroImage}
      />

      <div className={styles.overlay}></div>
    </section>
  );
}
