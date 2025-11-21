// components/HowItWorks.jsx
import Image from "next/image";
import styles from "../styles/HowItWorks.module.css";

export default function HowItWorks() {
  return (
    <section className={styles.howSection}>
      {/* Background Image */}
      <Image
        src="/images/howitworks.jpg"
        alt="How It Works"
        fill
        className={styles.bgImage}
      />

      {/* Overlay + Content Box */}
      <div className={styles.overlay}>
        <div className={styles.textBox}>
          <h3>HOW IT WORKS</h3>
          <h4>3 Easy Steps</h4>

          <ol>
            <li>Sign Up / Log In – Create an Account</li>
            <li>Bid or Buy – Choose a Forward or Dutch Auction</li>
            <li>Pay & Receive – Complete payment securely and track delivery</li>
          </ol>

          <a href="#" className={styles.btn}>
            BID NOW
          </a>
        </div>
      </div>
    </section>
  );
}
