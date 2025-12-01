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
    
    if (diff <= 0) return "Ended";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    } else {
      return `${seconds}s`;
    }
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

    async function loadFromDB() {
      try {
        let url = "/api/controller/auction";

        if (filterType === "Forward" || filterType === "Dutch") {
          url += `?type=${filterType.toLowerCase()}`;
        }

        const res = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!res.ok) throw new Error("Failed to load auctions from DB");
        const data = await res.json();

        console.log('Loaded auctions:', data); // Debug log

        const normalized = data.map((row) => ({
          id: row.auction_id,
          name: row.title,
          image: row.image_url,
          auctionType: row.auction_type === "FORWARD" ? "Forward" : "Dutch",
          currentPrice: Number(row.current_price),
          endTime: row.end_time, // Store the actual end_time
        }));

        setItems(normalized);
      } catch (err) {
        console.error("DB fetch error:", err);
      }
    }

    loadFromDB();

    // Update timer every second
    const interval = setInterval(() => {
      setItems(prevItems => [...prevItems]); // Force re-render to update times
    }, 1000);

    return () => clearInterval(interval);
  }, [filterType]); 

  async function handleDelete(id) {
    if (!confirm("Delete this item?")) return;

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
      if (sortOption === "timeAsc") {
        const timeA = new Date(a.endTime) - new Date();
        const timeB = new Date(b.endTime) - new Date();
        return timeA - timeB;
      }
      if (sortOption === "timeDesc") {
        const timeA = new Date(a.endTime) - new Date();
        const timeB = new Date(b.endTime) - new Date();
        return timeB - timeA;
      }
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

        {filteredItems.map((item) => {
          const timeLeft = calculateRemaining(item.endTime);
          
          return (
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
                ⏳ {timeLeft}
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
          );
        })}
      </div>
    </div>
  );
}
