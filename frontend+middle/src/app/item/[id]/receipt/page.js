"use client";

import { use, useEffect, useState } from "react";
import styles from "./Receipt.module.css";

export default function ReceiptPage(props) {
  // Next.js 16 unwrap
  const { id } = use(props.params);
  const auctionId = String(id);

  const [auction, setAuction] = useState(null);
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    // -------------------------------
    // Load Auction Data (LOCAL MODE)
    // -------------------------------
    const saved = localStorage.getItem("ddj-items");
    if (saved) {
      const items = JSON.parse(saved);
      const item = items.find((x) => String(x.id) === auctionId);

      if (item) {
        setAuction({
          id: item.id,
          name: item.name,
          shippingPrice: Number(item.shippingPrice) || 0,
          expeditedPrice: Number(item.expeditedPrice) || 0,
          shippingDays: Number(item.shippingDays) || 7,
        });
      }
    }

    // -------------------------------
    // Load Payment Info (LOCAL MODE)
    // -------------------------------
    const receipt = localStorage.getItem("ddj-receipt");
    if (receipt) {
      setPayment(JSON.parse(receipt));
    }

    // ======================================================
    // database version
    // ======================================================
    /*
    async function loadFromDB() {
      try {
        const res = await fetch(`/api/controller/payments/of-auction/${auctionId}`);
        const data = await res.json();

        setAuction({
          id: data.item.item_id,
          name: data.item.title,
          shippingPrice: Number(data.item.shipping_price),
          expeditedPrice: Number(data.item.expedited_price),
          shippingDays: Number(data.item.shipping_days)
        });

        setPayment(data.payment);
      } catch (err) {
        console.error("Receipt DB Load Error:", err);
      }
    }

    loadFromDB();
    */
  }, [auctionId]);

  // ---------------------------------------------------
  // If missing info (user refreshed w/out paying)
  // ---------------------------------------------------
  if (!auction || !payment) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.card}>
          <h1>Receipt</h1>
          <p>Receipt data not found. Please complete payment first.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1>Payment Receipt</h1>

        <p>
          <strong>Item:</strong> {auction.name}
        </p>

        <p>
          <strong>Total Paid:</strong> ${payment.totalPaid}
        </p>

        <p>
          <strong>Shipping Address:</strong> {payment.shippingAddress}
        </p>

        <p>
          <strong>Shipping Type:</strong>{" "}
          {payment.expedited ? "Expedited" : "Standard"}
        </p>

        <p className={styles.shipInfo}>
          The item will be shipped in {auction.shippingDays} days.
        </p>

        <p className={styles.small}>
          Payment ID: {payment.id} <br />
          Date: {new Date(payment.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
