"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "../styles/Catalogue.module.css";

export default function Catalogue() {
  const categories = [
    { name: "Cars", img: "/images/car.png" },
    { name: "Properties", img: "/images/house.png" },
    { name: "Electronics", img: "/images/electronics.png" },
    { name: "Services", img: "/images/services.png" },
    { name: "Art", img: "/images/painting.png" },
  ];

  const [index, setIndex] = useState(0);

  const nextSlide = () => {
    setIndex((prev) => (prev + 1) % categories.length);
  };

  const prevSlide = () => {
    setIndex((prev) =>
      prev === 0 ? categories.length - 1 : prev - 1
    );
  };

  useEffect(() => {
    const auto = setInterval(nextSlide, 3000);
    return () => clearInterval(auto);
  }, []);

  return (
    <section className={styles.wrapper}>
      <h2 className={styles.title}>Browse by Category</h2>

      <div className={styles.carousel}>
        <button className={styles.arrowLeft} onClick={prevSlide}>
          ❮
        </button>

        <div className={styles.centerBox}>
          {categories.map((cat, i) => {
            let position = (i - index + categories.length) % categories.length;

            return (
              <Link
                key={i}
                href={`/browse-auctions?category=${encodeURIComponent(cat.name)}`}
                className={`${styles.card} ${styles["pos" + position]}`}
              >
                <Image
                  src={cat.img}
                  width={300}
                  height={200}
                  alt={cat.name}
                />
                <p className={styles.label}>{cat.name}</p>
              </Link>
            );
          })}
        </div>

        <button className={styles.arrowRight} onClick={nextSlide}>
          ❯
        </button>
      </div>
    </section>
  );
}
