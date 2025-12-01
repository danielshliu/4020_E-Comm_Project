"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Pay.module.css";

export default function PayPage(props) {
  
  const { id } = use(props.params);
  const auctionId = String(id);

  const router = useRouter();
  const [auction, setAuction] = useState(null);
  const [useExpedited, setUseExpedited] = useState(false);

  const [card, setCard] = useState({
    number: "",
    name: "",
    expiry: "",
    cvv: "",
  });

  const user = JSON.parse(sessionStorage.getItem("ddj-user") || "{}");
  const [shippingAddress, setShippingAddress] = useState(user.address || "");

  // ======================================================
  // database mode 
  // ======================================================
  
  useEffect(() => {
    async function loadFromDB() {
      try {
        const res = await fetch(`/api/controller/auction/${auctionId}`);
        const data = await res.json();

        setAuction({
          id: data.auction_id,
          name: data.title,
          currentPrice: Number(data.current_price) || 0,
          shippingPrice: Number(data.shipping_price) || 10,
          expeditedPrice: Number(data.expedited_price) || 15,
          shippingDays: Number(data.shipping_days) || 5,
        });
      } catch (err) {
        console.error("DB Auction Load Error:", err);
        alert('Failed to load auction details');
      }
    }

    loadFromDB();
  }, [auctionId]);
  
  if (!auction) return <p>Loading...</p>;

  const baseShipping = auction.shippingPrice;
  const expedited = auction.expeditedPrice;
  const total = auction.currentPrice + baseShipping + (useExpedited ? expedited : 0);

  // ======================================================
  // local storage mode (CURRENT DEMO)
  // ======================================================
  // useEffect(() => {
  //   const saved = localStorage.getItem("ddj-items");
  //   if (!saved) return;

  //   const all = JSON.parse(saved);
  //   const found = all.find((x) => String(x.id) === auctionId);

  //   if (found) setAuction(found);
  // }, [auctionId]);

  // if (!auction) return <p>Loading...</p>;

  // const baseShipping = Number(auction.shippingPrice) || 0;
  // const expedited = Number(auction.expeditedPrice) || 0;

  // const total =
  //   Number(auction.currentPrice) +
  //   baseShipping +
  //   (useExpedited ? expedited : 0);

  // ======================================================
  // database payment mode
  // ======================================================
  
  async function payWithDB() {
    // Check if user is logged in
    if (!user || !user.user_id) {
      alert("You must be logged in to make a payment.");
      router.push("/signin");
      return;
    }

    // Validate shipping address
    if (!shippingAddress || shippingAddress.trim() === "") {
      alert("Please enter a shipping address.");
      return;
    }

    try {
      console.log('Sending payment:', {
        auction_id: auctionId,
        payer_id: user.user_id,
        shipping_address: shippingAddress,
        expedited: useExpedited,
      }); // Debug log

      const res = await fetch("/api/payment/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auction_id: auctionId,
          payer_id: user.user_id,
          shipping_address: shippingAddress,
          expedited: useExpedited,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Payment failed');

      // Store receipt for display
      sessionStorage.setItem("ddj-receipt", JSON.stringify({
        id: data.payment.payment_id,
        auctionId: auction.id,
        name: auction.name,
        totalPaid: total,
        expedited: useExpedited,
        shippingAddress: shippingAddress,
        createdAt: Date.now(),
        shippingDays: auction.shippingDays,
      }));

      router.push(`/item/${auctionId}/receipt`);
    } catch (err) {
      console.error("DB Payment Error:", err);
      alert("Payment failed.");
    }
  }
  

  // ======================================================
  // local storage payment (CURRENT DEMO)
  // ======================================================
  // function payLocal() {
  //   // winner check
  //   if (!auction.winner && auction.highestBidder !== "You") {
  //     alert("You cannot pay for an item you did not win.");
  //     return;
  //   }

  //   const receipt = {
  //     id: crypto.randomUUID(),
  //     auctionId: auction.id,
  //     name: auction.name,
  //     payer: user.username || "You",
  //     totalPaid: total,
  //     expedited: useExpedited,
  //     shippingAddress: shippingAddress || "123 Default Street",
  //     createdAt: Date.now(),
  //     shippingDays: auction.shippingDays,
  //   };

  //   // save receipt
  //   localStorage.setItem("ddj-receipt", JSON.stringify(receipt));

  //   // redirect
  //   window.location.href = `/item/${auctionId}/receipt`;
  // }

  function handlePayment() {
    if (!card.number || !card.name || !card.expiry || !card.cvv) {
      alert("All payment fields must be filled.");
      return;
    }

    // LOCAL MODE
    // payLocal();

    // DB MODE
    payWithDB();
  }

  return (
    <div className={styles.box}>
      <h1 className={styles.title}>Payment for {auction.name}</h1>

      <div className={styles.summary}>
        <p>Item Price: ${auction.currentPrice}</p>
        <p>Shipping: ${baseShipping}</p>

        {auction.expeditedPrice > 0 && (
          <label className={styles.checkboxRow}>
            <input
              type="checkbox"
              checked={useExpedited}
              onChange={(e) => setUseExpedited(e.target.checked)}
            />
            <span>Expedited Shipping (+${expedited})</span>
          </label>
        )}

        <h2 className={styles.total}>Total: ${total}</h2>
      </div>

      <div className={styles.shippingSection}>
        <h3 className={styles.sectionTitle}>Shipping Address</h3>
        <p className={styles.userLine}>
          Logged in as: <strong>{user.username || "Guest"}</strong>
        </p>
        <textarea
          className={styles.textarea}
          placeholder="Enter your shipping address"
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
        />
        <p className={styles.helperText}>
          Please confirm your shipping address is correct before submitting payment.
        </p>
      </div>

      <div className={styles.paymentSection}>
        <h3 className={styles.sectionTitle}>Payment Info</h3>

        <input
          className={styles.input}
          placeholder="Card Number"
          value={card.number}
          onChange={(e) => setCard({ ...card, number: e.target.value })}
        />

        <input
          className={styles.input}
          placeholder="Name on Card"
          value={card.name}
          onChange={(e) => setCard({ ...card, name: e.target.value })}
        />

        <input
          className={styles.input}
          placeholder="Expiry Date (MM/YY)"
          value={card.expiry}
          onChange={(e) => setCard({ ...card, expiry: e.target.value })}
        />

        <input
          className={styles.input}
          placeholder="CVV"
          value={card.cvv}
          onChange={(e) => setCard({ ...card, cvv: e.target.value })}
        />
      </div>

      <button className={styles.payBtn} onClick={handlePayment}>
        Submit Payment
      </button>
    </div>
  );
}
