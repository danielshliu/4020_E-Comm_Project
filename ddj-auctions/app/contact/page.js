"use client";

import styles from "./Contact.module.css";
import Image from "next/image";

export default function ContactPage() {
  return (
    <div className={styles.wrapper}>

      {/* HERO */}
      <section className={styles.hero}>
        <Image
          src="https://images.unsplash.com/photo-1521791136064-7986c2920216"
          alt="Contact Banner"
          fill
          className={styles.heroImage}
        />
        <div className={styles.heroText}>
          <h1>Contact Us</h1>
          <p>We're here to help you with anything you need.</p>
        </div>
      </section>

      {/* CONTACT GRID */}
      <section className={styles.grid}>
        
        {/* LEFT — Contact Info */}
        <div className={styles.infoBox}>
          <h2>Get in Touch</h2>

          <p><strong>Email:</strong> support@ddjauctions.com</p>
          <p><strong>Phone:</strong> +1 (416) 555-9822</p>

          <p>
            <strong>Location:</strong><br />
            4700 Keele Street<br />
            Toronto, Ontario<br />
            Canada
          </p>

          <p className={styles.subtitle}>Business Hours</p>
          <p>Monday – Friday: 9:00 AM – 6:00 PM</p>
          <p>Saturday: 10:00 AM – 4:00 PM</p>
          <p>Sunday & Holidays: Closed</p>
        </div>

        {/* RIGHT — Contact Form */}
        <form className={styles.form}>
          <h2>Send Us a Message</h2>

          <input type="text" placeholder="Your Name" required />
          <input type="email" placeholder="Your Email" required />

          <input type="text" placeholder="Subject" required />

          <textarea placeholder="Your Message" required></textarea>

          <button>Submit</button>
        </form>
      </section>

      {/* MAP SECTION */}
      <section className={styles.mapSection}>
        <h2>Find Us</h2>
        <iframe
          className={styles.map}
          src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2886.308446520203!2d-79.50641392368612!3d43.77343967109708!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x882b2d0e89e8aa8b%3A0xaea5c3a8b29e146c!2sYork%20University%20-%20Keele%20Campus!5e0!3m2!1sen!2sca!4v1700000000000!5m2!1sen!2sca"
          loading="lazy"
        ></iframe>
      </section>

    </div>
  );
}
