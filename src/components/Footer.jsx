import Image from "next/image";
import styles from "../styles/Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        
        <div className={styles.left}>
          <Image
            src="/images/logo1.png"
            width={90}
            height={75}
            alt="DDJ Logo"
          />
        </div>

        <div className={styles.right}>
          <div className={styles.topRow}>
            <span>Toronto, Ontario, M3P 1J2, Canada</span>
            <div className={styles.divider}></div>
            <a href="mailto:ddjauctions@gmail.com">ddjauctions@gmail.com</a>
          </div>

          <div className={styles.line}></div>

          <div className={styles.bottomRow}>
            <span>Copyright © 2024 DDJ AUCTIONSs Inc.</span>
            <span>(407) 341-7822</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
