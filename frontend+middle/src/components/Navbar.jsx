// components/Navbar.jsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import styles from "../styles/Navbar.module.css";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const toggleMenu = () => setOpen((prev) => !prev);
  const closeMenu = () => setOpen(false);

  const loadUserFromSession = () => {
    if (typeof window === "undefined") return;
    try {
      const stored = window.sessionStorage.getItem("ddj-user");
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error("Error loading user from sessionStorage:", e);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUserFromSession();
  }, []);

  useEffect(() => {
    loadUserFromSession();
  }, [pathname]);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      window.sessionStorage.removeItem("ddj-user");
      document.cookie = "ddj-user=; Max-Age=0; path=/;";
    }
    setUser(null);
    closeMenu();
    router.push("/signin");
  };

  return (
    <header className={styles.navbar}>
      <div className={styles.logo}>
        <Link href="/" onClick={closeMenu}>
          <Image src="/images/logo1.png" width={80} height={80} alt="DDJ Logo" />
        </Link>
      </div>

      <button
        className={styles.menuToggle}
        onClick={toggleMenu}
        aria-label="Toggle navigation"
      >
        <span />
        <span />
        <span />
      </button>

      <nav className={`${styles.nav} ${open ? styles.open : ""}`}>
        <ul className={styles.navLinks}>
          <li>
            <Link href="/" onClick={closeMenu}>
              HOME
            </Link>
          </li>
          <li>
            <Link href="/about-us" onClick={closeMenu}>
              ABOUT US
            </Link>
          </li>
          <li>
            <Link href="/browse-auctions" onClick={closeMenu}>
              BROWSE AUCTIONS
            </Link>
          </li>
          <li>
            <Link href="/contact" onClick={closeMenu}>
              CONTACT US
            </Link>
          </li>
          <li>
            <Link
              href="/add-item"
              onClick={closeMenu}
              style={{ color: "red", fontWeight: 700 }}
            >
              SELL ITEM
            </Link>
          </li>
          {user ? (
            <>
              <li>
              <button
                type="button"
                onClick={handleLogout}
                className={styles.navLinkButton}
              >
                LOG OUT
              </button>
              </li>
            </>
          ) : (
            <li>
              <Link
                href="/signin"
                onClick={closeMenu}
                style={{ fontWeight: 600 }}
              >
                SIGN IN
              </Link>
            </li>
          )}
        </ul>
      </nav>
    </header>
  );
}
