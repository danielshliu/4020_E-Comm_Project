"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import styles from "./Item.module.css"; 

export default function ItemPage(props) {
  const { id } = use(props.params);
  const auctionId = String(id);

  const router = useRouter();

  const [auction, setAuction] = useState(null);
  const [userBid, setUserBid] = useState("");
  const [hasEnded, setHasEnded] = useState(false);

  function calculateRemaining(endTime) {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;
    if (diff <= 0) return 0;
    return Math.floor(diff / (1000 * 60 * 60));
  }

  useEffect(() => {
    // ======================================================
    // database version
    // ======================================================
    /*
    async function loadFromDB() {
      const res = await fetch(`/api/controller/auction/${auctionId}`);
      const data = await res.json();

      const timeLeft = calculateRemaining(data.auction.end_time);

      setAuction({
        id: data.auction.auction_id,
        name: data.auction.title,
        description: data.auction.description,
        image: data.auction.image_url,
        auctionType: data.auction.auction_type === "FORWARD" ? "Forward" : "Dutch",
        currentPrice: Number(data.auction.current_price),
        highestBidder: data.bids.length ? data.bids[0].bidder_username : "None",
        remainingTime: timeLeft,
        shippingPrice: Number(data.auction.shipping_price),
        expeditedPrice: Number(data.auction.expedited_price),
        shippingDays: Number(data.auction.shipping_days),
        winner: data.winner_username,
      });

      if (timeLeft <= 0 || data.winner_username) {
        setHasEnded(true);
      }
    }

    loadFromDB();
    return;
    */

    // ======================================================
    // local storage version
    // ======================================================
    const saved = localStorage.getItem("ddj-items");
    if (!saved) return;

    const all = JSON.parse(saved);
    const found = all.find((x) => String(x.id) === auctionId);

    if (found) {
      const timeLeft = Number(found.remainingTime);

      setAuction({
        ...found,
        currentPrice: Number(found.currentPrice),
        shippingPrice: Number(found.shippingPrice),
        expeditedPrice: Number(found.expeditedPrice),
        shippingDays: Number(found.shippingDays),
      });

      if (timeLeft <= 0 || found.winner) setHasEnded(true);
    }
  }, [auctionId]);

  // ======================================================
  // forward auction: place bid
  // ======================================================
  function submitBid() {
    if (!auction) return;

    const newBid = Number(userBid);

    if (isNaN(newBid) || newBid <= auction.currentPrice) {
      alert("Your bid must be higher than current price.");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("ddj-items"));
    const index = saved.findIndex((x) => String(x.id) === auctionId);

    saved[index].currentPrice = newBid;
    saved[index].highestBidder = "You";

    localStorage.setItem("ddj-items", JSON.stringify(saved));

    setAuction({
      ...auction,
      currentPrice: newBid,
      highestBidder: "You",
    });

    setUserBid("");
    alert("Bid placed!");
  }

  // ======================================================
  // dutch auction: buy now
  // ======================================================
  function buyNow() {
    alert(`You bought this item for $${auction.currentPrice}!`);

    const saved = JSON.parse(localStorage.getItem("ddj-items"));
    const index = saved.findIndex((x) => String(x.id) === auctionId);

    saved[index].winner = "You";
    saved[index].remainingTime = 0;

    localStorage.setItem("ddj-items", JSON.stringify(saved));

    setHasEnded(true);
  }

  if (!auction) return <p>Loading...</p>;

  return (
    <div className={styles.wrapper}>
      {!hasEnded ? (
        <>
          <h1>{auction.name}</h1>

          <Image
            src={auction.image}
            width={500}
            height={350}
            alt={auction.name}
            className={styles.image}
          />

          <p className={styles.desc}>{auction.description}</p>
          <p className={styles.price}>Current Price: ${auction.currentPrice}</p>

          {/* ====================== Forward Auction ====================== */}
          {auction.auctionType === "Forward" && (
            <>
              <p>Highest Bidder: {auction.highestBidder}</p>

              <p className={styles.time}>
                Time Left: {auction.remainingTime} hours
              </p>

              <input
                type="number"
                value={userBid}
                onChange={(e) => setUserBid(e.target.value)}
                className={styles.input}
                placeholder="Your Bid"
              />

              <button className={styles.bidBtn} onClick={submitBid}>
                BID
              </button>
            </>
          )}

          {/* ====================== Dutch Auction ====================== */}
          {auction.auctionType === "Dutch" && (
            <>
              <p className={styles.time}>
                Time Left: {auction.remainingTime} hours
              </p>

              <button className={styles.buyBtn} onClick={buyNow}>
                BUY NOW
              </button>
            </>
          )}
        </>
      ) : (
        // ======================================================
        // auction ended to pay now
        // ======================================================
        <div className={styles.endBox}>
          <h2>Auction Has Ended</h2>

          <p>Final Price: ${auction.currentPrice}</p>

          {auction.auctionType === "Forward" ? (
            <p>Winner: {auction.highestBidder}</p>
          ) : (
            <p>You purchased this item</p>
          )}

          <button
            className={styles.payBtn}
            onClick={() => router.push(`/item/${auction.id}/pay`)}
          >
            Pay Now
          </button>
        </div>
      )}
    </div>
  );
}
