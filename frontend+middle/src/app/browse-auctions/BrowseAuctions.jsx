
"use client";

import { useEffect, useState } from "react";
import styles from "./Browse.module.css";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";

export default function BrowseAuctions() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortOption, setSortOption] = useState("none");
  const [isAdmin, setIsAdmin] = useState(false);

  function calculateRemaining(endTime) {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }

  useEffect(() => {
    const typeParam = (searchParams.get("type") || "").toLowerCase();
    if (typeParam === "forward") {
      setFilterType("Forward");
    } else if (typeParam === "dutch") {
      setFilterType("Dutch");
    }
  }, [searchParams]);

  useEffect(() => {
    // Detect admin
    const storedUser = sessionStorage.getItem("ddj-user");
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        if (u.role === "admin") setIsAdmin(true);
      } catch {}
    }

    // ============================================================
    // DATABASE VERSION: load auctions from DB
    //    - Uncomment this block and comment out the local-storage
    //      block when you connect your backend.
    // ============================================================
    
    async function loadFromDB() {
      try {
        let url = "/api/controller/auction";

        // If you want the backend to filter by type too, you can
        // pass it via query string:
        if (filterType === "Forward" || filterType === "Dutch") {
          url += `?type=${filterType.toLowerCase()}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to load auctions from DB");
        const data = await res.json();

        // Expecting an array of rows like:
        // {
        //   auction_id,
        //   title,
        //   image_url,
        //   auction_type,        // "FORWARD" or "DUTCH"
        //   current_price,
        //   end_time,

        // }
        const normalized = data.map((row) => ({
          id: row.auction_id,
          name: row.title,
          image: row.image_url,
          auctionType: row.auction_type === "FORWARD" ? "Forward" : "Dutch",
          currentPrice: Number(row.current_price),
          remainingTime: calculateRemaining(row.end_time),
        }));

        setItems(normalized);
      } catch (err) {
        console.error("DB fetch error:", err);
      }
    }

    loadFromDB();

    

    // ============================================================
    // LOCAL STORAGE VERSION
    // ============================================================
    // const saved = localStorage.getItem("ddj-items");

    // if (saved) {
    //   const parsed = JSON.parse(saved).map((item) => ({
    //     id: item.id,
    //     name: item.name,
    //     image: item.image,
    //     auctionType: item.auctionType, // "Forward" or "Dutch"
    //     currentPrice: Number(item.currentPrice ?? item.price ?? 0),
    //     remainingTime: Number(item.remainingTime) || 0,
    //   }));

    //   setItems(parsed);
    // }
  }, [filterType]); 

  // ============================================================
  // ADMIN DELETE ITEM
  // ============================================================
  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;

    // LOCAL MODE:
    // const saved = JSON.parse(localStorage.getItem("ddj-items") || "[]");
    // const filtered = saved.filter((i) => String(i.id) !== String(id));
    // localStorage.setItem("ddj-items", JSON.stringify(filtered));
    // setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));

    // ============================================================
    // DATABASE VERSION
    // ============================================================
    
    try {
      const res = await fetch(`/api/controller/auction/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete item in DB");

      const updated = items.filter((i) => String(i.id) !== String(id));
      setItems(updated);
    } catch (err) {
      console.error("DB delete error:", err);
    }
    
  }

  // SEARCH + FILTER + SORT
  const filteredItems = items
    .filter((item) =>
      item.name.toLowerCase().includes(search.toLowerCase())
    )
    .filter((item) =>
      filterType === "all" ? true : item.auctionType === filterType
    )
    .sort((a, b) => {
      if (sortOption === "priceAsc") return a.currentPrice - b.currentPrice;
      if (sortOption === "priceDesc") return b.currentPrice - a.currentPrice;
      if (sortOption === "timeAsc") return a.remainingTime - b.remainingTime;
      if (sortOption === "timeDesc") return b.remainingTime - a.remainingTime;
      return 0;
    });

  return (
    <div className={styles.wrapper}>
      <h1 className={styles.title}>Browse Auctions</h1>

      {/* SEARCH & FILTER */}
      <div className={styles.topControls}>
        <input
          type="text"
          className={styles.search}
          placeholder="Search items..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select
          className={styles.filter}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">All Types</option>
          <option value="Forward">Forward Auctions</option>
          <option value="Dutch">Dutch Auctions</option>
        </select>

        <select
          className={styles.sort}
          value={sortOption}
          onChange={(e) => setSortOption(e.target.value)}
        >
          <option value="none">Sort By</option>
          <option value="priceAsc">Price ↑</option>
          <option value="priceDesc">Price ↓</option>
          <option value="timeAsc">Time Left ↑</option>
          <option value="timeDesc">Time Left ↓</option>
        </select>
      </div>

      {/* GRID */}
      <div className={styles.grid}>
        {filteredItems.length === 0 && (
          <p className={styles.noItems}>No items found.</p>
        )}

        {filteredItems.map((item) => (
          <div key={item.id} className={styles.card}>
            <Image
              src={item.image}
              width={300}
              height={250}
              alt={item.name}
              className={styles.image}
            />

            <h3 className={styles.name}>{item.name}</h3>

            <p className={styles.price}>
              ${item.currentPrice.toLocaleString()}
            </p>

            <p className={styles.type}>
              {item.auctionType === "Forward"
                ? "Forward Auction"
                : "Dutch Auction"}
            </p>

            <p className={styles.timeLeft}>
              ⏳ {item.remainingTime} hours left
            </p>

            <button
              className={styles.bidBtn}
              onClick={() => router.push(`/item/${item.id}`)}
            >
              Bid / View
            </button>

            {isAdmin && (
              <button
                className={styles.deleteBtn}
                onClick={() => handleDelete(item.id)}
              >
                Delete Item
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
