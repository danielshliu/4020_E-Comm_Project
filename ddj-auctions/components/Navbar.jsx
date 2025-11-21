"use client";

import Link from "next/link";
import styles from "../styles/Navbar.module.css";
import Image from "next/image";

export default function Navbar() {
  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/">
          <Image src="/images/logo1.png" width={80} height={80} alt="DDJ Logo" />
        </Link>
      </div>

      <nav>
        <ul className={styles.navLinks}>
          <li><Link href="/">HOME</Link></li>
          <li><Link href="/about-us">ABOUT US</Link></li>
          <li><Link href="/browse-auctions">BROWSE AUCTIONS</Link></li>
          <li><Link href="/contact">CONTACT US</Link></li>
          <li> <Link href="/add-item" style={{ color: "red", fontWeight: 700 }}>SELL ITEM</Link></li>
          <li> <Link href="/signin" style={{ fontWeight: 600 }}>SIGN IN </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
