// components/Welcome.jsx
import styles from "../styles/Welcome.module.css";

export default function Welcome() {
  return (
    <section className={styles.welcome}>
      <h2>WELCOME</h2>
      <div className={styles.underline}></div>

      <div className={styles.columns}>
        {/* About Us */}
        <div className={styles.column}>
          <h3>About Us</h3>
          <p>
            We are a modern online auction platform built to connect buyers and
            sellers through fast, fair, and transparent auctions. Our goal is to
            make online trading simple and exciting by offering both forward and
            Dutch auction options. Whether you’re bidding on unique items or
            selling your own, our system ensures secure transactions, real-time
            updates, and a smooth experience from listing to delivery.
          </p>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Why Choose Us */}
        <div className={styles.column}>
          <h3>Why Choose Us</h3>
          <p>
            Our auction platform is designed to make buying and selling simple,
            secure, and fair. We provide real-time bidding updates, encrypted
            payment processing, and reliable shipping options so you can shop
            with confidence. Whether you’re joining a fast-paced forward auction
            or a Dutch auction, our system ensures transparency, speed, and a
            user-friendly experience from start to finish.
          </p>
        </div>

        {/* Divider */}
        <div className={styles.divider}></div>

        {/* Our Services */}
        <div className={styles.column}>
          <h3>Our Services</h3>
          <p>
            Our platform offers a complete online auction experience designed to
            make buying and selling effortless. We provide both forward and
            Dutch auction options, allowing users to choose the style that best
            fits their needs. Sellers can easily list items, manage auctions, and
            update prices, while buyers enjoy real-time bidding, secure payment
            processing, and fast shipping options. With user-friendly tools and
            reliable support, our system ensures every transaction is
            transparent, safe, and convenient from start to finish.
          </p>
        </div>
      </div>
    </section>
  );
}
