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
  const [timeDisplay, setTimeDisplay] = useState("");

  // NEW: current logged-in user
  const [currentUser, setCurrentUser] = useState(null);

  // Load current user from sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("ddj-user");
    if (stored) {
      setCurrentUser(JSON.parse(stored));
    }
  }, []);

  function calculateRemaining(endTime) {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end - now;

    if (diff <= 0) {
      return { total: 0, display: "Ended" };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    let display = "";
    if (hours > 0) {
      display = `${hours}h ${minutes}m`;
    } else if (minutes > 0) {
      display = `${minutes}m ${seconds}s`;
    } else {
      display = `${seconds}s`;
    }

    return { total: diff, display };
  }

  useEffect(() => {
    async function loadFromDB() {
      try {
        const res = await fetch(`/api/controller/auction/${auctionId}`);

        if (!res.ok) throw new Error("Failed to load auction");

        const data = await res.json();

        const timeLeft = calculateRemaining(data.end_time);

        // data is assumed to be the flat auction object, with optional data.bids[]
        setAuction({
          id: data.auction_id,
          name: data.title,
          description: data.description,
          image: data.image_url,
          auctionType: data.auction_type === "FORWARD" ? "Forward" : "Dutch",
          currentPrice: Number(data.current_price),
          highestBidder:
            data.bids && data.bids.length
              ? data.bids[0].bidder_username
              : "None",
          endTime: data.end_time,
          shippingPrice: Number(data.shipping_price || 10),
          expeditedPrice: Number(data.expedited_price || 15),
          shippingDays: Number(data.shipping_days || 5),

          // NEW: store winner_id from backend
          winnerId: data.winner_id ?? null,
        });

        setTimeDisplay(timeLeft.display);

        if (timeLeft.total <= 0 || data.winner_id) {
          setHasEnded(true);
        }
      } catch (err) {
        console.error("Load auction error:", err);
        alert("Failed to load auction details");
      }
    }

    loadFromDB();
  }, [auctionId]);

  // Update timer every second
  useEffect(() => {
    if (!auction || hasEnded) return;

    const interval = setInterval(() => {
      const timeLeft = calculateRemaining(auction.endTime);
      setTimeDisplay(timeLeft.display);

      if (timeLeft.total <= 0) {
        setHasEnded(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction, hasEnded]);

  // ======================================================
  // forward auction: place bid
  // ======================================================
  async function submitBid() {
    if (!auction) return;

    if (hasEnded) {
      alert("This auction has ended.");
      return;
    }

    const newBid = Number(userBid);

    if (isNaN(newBid) || newBid <= auction.currentPrice) {
      alert("Your bid must be higher than current price.");
      return;
    }

    // Get logged in user
    const user = JSON.parse(sessionStorage.getItem("ddj-user") || "{}");

    if (!user || !user.user_id) {
      alert("You must be logged in to place a bid.");
      router.push("/signin");
      return;
    }

    try {
      console.log("Submitting bid:", {
        auction_id: auctionId,
        bidder_id: user.user_id,
        amount: newBid,
      });

      const res = await fetch("/api/auction/bid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: auctionId,
          bidder_id: user.user_id,
          amount: newBid,
        }),
      });

      const data = await res.json();

      console.log("Bid response:", { ok: res.ok, status: res.status, data });

      if (!res.ok) {
        throw new Error(data.error || "Failed to place bid");
      }

      setUserBid("");
      alert("Bid placed successfully!");

      // Reload auction data from server to get updated highest bidder
      const reloadRes = await fetch(`/api/controller/auction/${auctionId}`);
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json();

        const reloadHighest =
          reloadData.bids && reloadData.bids.length
            ? reloadData.bids[0].bidder_username
            : "None";

        setAuction((prev) => ({
          ...prev,
          currentPrice: Number(reloadData.current_price),
          highestBidder: reloadHighest,
          winnerId: reloadData.winner_id ?? prev.winnerId,
        }));
      }
    } catch (err) {
      console.error("Bid error:", err);
      alert("Failed to place bid: " + err.message);
    }
  }


  async function declinePurchase() {
    if (!auction) return;
  
    if (!currentUser || !currentUser.user_id) {
      alert("You must be logged in.");
      router.push("/signin");
      return;
    }
  
    try {
      const res = await fetch("/api/controller/auction/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: auctionId,
          user_id: currentUser.user_id,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to decline purchase");
      }
  
      alert(data.message || "You declined the purchase.");
  
      // Reload auction to reflect new winner + lowered price
      const reloadRes = await fetch(`/api/controller/auction/${auctionId}`);
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json();
        const timeLeft = calculateRemaining(reloadData.end_time);
  
        setAuction({
          id: reloadData.auction_id,
          name: reloadData.title,
          description: reloadData.description,
          image: reloadData.image_url,
          auctionType:
            reloadData.auction_type === "FORWARD" ? "Forward" : "Dutch",
          currentPrice: Number(reloadData.current_price),
          highestBidder:
            reloadData.bids && reloadData.bids.length
              ? reloadData.bids[0].bidder_username
              : "None",
          endTime: reloadData.end_time,
          shippingPrice: Number(reloadData.shipping_price || 10),
          expeditedPrice: Number(reloadData.expedited_price || 15),
          shippingDays: Number(reloadData.shipping_days || 5),
          winnerId: reloadData.winner_id ?? null,
        });
  
        setTimeDisplay(timeLeft.display);
        setHasEnded(timeLeft.total <= 0 || !!reloadData.winner_id);
      }
    } catch (err) {
      console.error("Decline error:", err);
      alert("Failed to decline: " + err.message);
    }
  }

  // ======================================================
  // dutch auction: buy now
  // ======================================================
  async function buyNow() {
    if (hasEnded) {
      alert("This auction has ended.");
      return;
    }

    // Get logged in user
    const user = JSON.parse(sessionStorage.getItem("ddj-user") || "{}");

    if (!user || !user.user_id) {
      alert("You must be logged in to buy.");
      router.push("/signin");
      return;
    }

    try {
      const res = await fetch("/api/auction/buy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: auctionId,
          buyer_id: user.user_id,
          accepted_price: auction.currentPrice,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to buy item");
      }

      alert(`You bought this item for $${auction.currentPrice}!`);
      setHasEnded(true);

      router.push(`/item/${auctionId}/pay`);
    } catch (err) {
      console.error("Buy error:", err);
      alert("Failed to buy item: " + err.message);
    }
  }

  async function declinePurchase() {
    if (!auction) return;
  
    // must be logged in
    if (!currentUser || !currentUser.user_id) {
      alert("You must be logged in.");
      router.push("/signin");
      return;
    }
  
    try {
      const res = await fetch("/api/auction/decline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: auctionId,
          user_id: currentUser.user_id,
        }),
      });
  
      const data = await res.json();
  
      if (!res.ok) {
        throw new Error(data.error || "Failed to decline purchase");
      }
  
      alert(data.message || "You declined the purchase.");
  
      // Reload auction to reflect new winner (2nd highest bidder or none)
      const reloadRes = await fetch(`/api/controller/auction/${auctionId}`);
      if (reloadRes.ok) {
        const reloadData = await reloadRes.json();
        const timeLeft = calculateRemaining(reloadData.end_time);
  
        setAuction({
          id: reloadData.auction_id,
          name: reloadData.title,
          description: reloadData.description,
          image: reloadData.image_url,
          auctionType:
            reloadData.auction_type === "FORWARD" ? "Forward" : "Dutch",
          currentPrice: Number(reloadData.current_price),
          highestBidder:
            reloadData.bids && reloadData.bids.length
              ? reloadData.bids[0].bidder_username
              : "None",
          endTime: reloadData.end_time,
          shippingPrice: Number(reloadData.shipping_price || 10),
          expeditedPrice: Number(reloadData.expedited_price || 15),
          shippingDays: Number(reloadData.shipping_days || 5),
          winnerId: reloadData.winner_id ?? null,
        });
  
        setTimeDisplay(timeLeft.display);
        setHasEnded(timeLeft.total <= 0 || reloadData.winner_id);
      }
    } catch (err) {
      console.error("Decline error:", err);
      alert("Failed to decline: " + err.message);
    }
  }

  if (!auction) return <p>Loading...</p>;

  console.log(auction.auctionType, auction.auctionType === "Forward")
  let isForwardWinner = false
  let isActualWinner = false
  if (auction.auctionType === "Forward"){
      isForwardWinner = currentUser.username === auction.highestBidder || auction.highestBidder === "None";
      isActualWinner = currentUser.username === auction.highestBidder
  }
 

  console.log(auction.highestBidder)

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
  
              <p className={styles.time}>Time Left: {timeDisplay}</p>
  
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
              <p className={styles.time}>Time Left: {timeDisplay}</p>
  
              <button className={styles.buyBtn} onClick={buyNow}>
                BUY NOW
              </button>
            </>
          )}
        </>
      ) : (
        // ======================================================
        // auction ended – pay now section
        // ======================================================
        <div className={styles.endBox}>
          <h2>Auction Has Ended</h2>
  
          <p>Final Price: ${auction.currentPrice}</p>
  
          {auction.auctionType === "Forward" ? (
            <>
              <p>Winner: {auction.highestBidder}</p>
  
              {isForwardWinner ? (
                <>
                  <button
                    className={styles.payBtn}
                    onClick={() => router.push(`/item/${auction.id}/pay`)}
                  >
                    Pay Now
                  </button>
  
                  {/* Only show Decline if user is the actual winner */}
                  {isActualWinner && (
                    <button
                      className={styles.payBtn}
                      onClick={declinePurchase}
                      style={{ marginLeft: "1rem" }}
                    >
                      Decline
                    </button>
                  )}
                </>
              ) : (
                <p className={styles.notice}>You have lost this auction</p>
              )}
            </>
          ) : (
            <>
              <p>You purchased this item</p>
              <button
                className={styles.payBtn}
                onClick={() => router.push(`/item/${auction.id}/pay`)}
              >
                Pay Now
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )};