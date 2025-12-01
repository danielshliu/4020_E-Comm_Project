"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./Receipt.module.css";

export default function ReceiptPage(props) {

  const { id } = use(props.params);
  const auctionId = String(id);

  const router = useRouter();
  const [receipt, setReceipt] = useState(null);

  // ======================================================
  // db rcpt mode
  // ======================================================
  /*
  useEffect(() => {
    async function loadReceiptFromDB() {
      try {
        const res = await fetch(`/api/payment/receipt/${auctionId}`);

        if (!res.ok) throw new Error("Failed to load receipt from DB");
        const data = await res.json();

        setReceipt({
          id: data.receipt.receipt_id,
          auctionId: data.receipt.auction_id,
          name: data.receipt.title,
          payer: data.receipt.payer_username,
          totalPaid: Number(data.receipt.total_paid),
          expedited: !!data.receipt.expedited,
          shippingAddress: data.receipt.shipping_address,
          shippingDays: Number(data.receipt.shipping_days),
          createdAt: new Date(data.receipt.created_at).getTime(),
        });
      } catch (err) {
        console.error("DB Receipt Load Error:", err);
      }
    }

    loadReceiptFromDB();
  }, [auctionId]);
  */

  // ======================================================
  // local
  // ======================================================
  useEffect(() => {
    try {
      const saved = localStorage.getItem("ddj-receipt");
      if (!saved) return;

      const parsed = JSON.parse(saved);

      if (String(parsed.auctionId) === auctionId) {
        setReceipt(parsed);
      }
    } catch (err) {
      console.error("Local Receipt Parse Error:", err);
    }
  }, [auctionId]);

  if (!receipt) return <p>Loading receipt...</p>;

  const created = new Date(receipt.createdAt);
  const totalPaid = Number(receipt.totalPaid ?? 0);

  function handleGoHome() {
    router.push("/");
  }

  function handleContinueShopping() {
    router.push("/browse-auctions");
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <h1 className={styles.title}>Payment Receipt</h1>
        <p className={styles.subtitle}>
          Thank you, {receipt.payer || "Customer"}! Your payment was successful.
        </p>

        <div className={styles.row}>
          <span className={styles.label}>Item</span>
          <span className={styles.value}>{receipt.name}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Auction ID</span>
          <span className={styles.value}>{receipt.auctionId}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Total Paid</span>
          <span className={styles.value}>${totalPaid.toFixed(2)}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Shipping Address</span>
          <span className={styles.value}>{receipt.shippingAddress}</span>
        </div>

        <div className={styles.row}>
          <span className={styles.label}>Shipping Method</span>
          <span className={styles.value}>
            {receipt.expedited ? "Expedited Shipping" : "Standard Shipping"}
          </span>
        </div>

        {receipt.shippingDays != null && (
          <div className={styles.row}>
            <span className={styles.label}>Estimated Delivery</span>
            <span className={styles.value}>
              {receipt.shippingDays} business day
              {receipt.shippingDays === 1 ? "" : "s"}
            </span>
          </div>
        )}

        <div className={styles.row}>
          <span className={styles.label}>Date</span>
          <span className={styles.value}>{created.toLocaleString()}</span>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={handleGoHome}
          >
            Go Home
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={handleContinueShopping}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
}
