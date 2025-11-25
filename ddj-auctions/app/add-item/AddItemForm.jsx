"use client";

import { useState, useEffect } from "react";
import styles from "./AddItem.module.css";

export default function AddItemForm() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    description: "",
    price: "",
    auctionType: "",
    image: "",
    shippingPrice: "",
    expeditedPrice: "",
    shippingDays: "",
    remainingTime: "",
    reservePrice: "",
    priceDropStep: "",
    priceDropIntervalSec: "",
  });

  const [editing, setEditing] = useState(false);

  // Load item if editing
  useEffect(() => {
    const stored = sessionStorage.getItem("editing-item");
    if (stored) {
      const item = JSON.parse(stored);
      setForm({
        ...item,
        price: item.currentPrice ?? "",
        remainingTime: item.remainingTime ?? "",
      });
      setEditing(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // ------------------------------------------------------------
  // LOCAL STORAGE MODE
  // ------------------------------------------------------------
  const handleSubmit = () => {
    let items = JSON.parse(localStorage.getItem("ddj-items") || "[]");

    const newItem = {
      id: editing ? form.id : Date.now().toString(),
      name: form.name,
      description: form.description,
      image: form.image,
      auctionType: form.auctionType,
      currentPrice: Number(form.price),
      shippingPrice: Number(form.shippingPrice),
      expeditedPrice: Number(form.expeditedPrice),
      shippingDays: Number(form.shippingDays),
      remainingTime: Number(form.remainingTime),
      reservePrice:
        form.auctionType === "Dutch" ? Number(form.reservePrice) : 0,
      priceDropStep:
        form.auctionType === "Dutch" ? Number(form.priceDropStep) : 0,
      priceDropIntervalSec:
        form.auctionType === "Dutch"
          ? Number(form.priceDropIntervalSec)
          : 0,
      highestBidder: "None",
      winner: null,
    };

    if (editing) {
      items = items.map((i) => (i.id === newItem.id ? newItem : i));
      sessionStorage.removeItem("editing-item");
    } else {
      items.push(newItem);
    }

    localStorage.setItem("ddj-items", JSON.stringify(items));
    alert(editing ? "Item updated!" : "Item added!");
    window.location.href = "/browse-auctions";
  };

  // ------------------------------------------------------------
  // Data base version 
  // ------------------------------------------------------------
  /*
  async function saveToDB() {
    try {
      const sessionUser = JSON.parse(sessionStorage.getItem("ddj-user"));
      const seller_id = sessionUser?.user_id;

      if (!seller_id) {
        alert("User not logged in.");
        return;
      }

      // 1️ Create item in catalogue
      const itemRes = await fetch("/api/controller/catalogue/createItem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_id,
          title: form.name,
          description: form.description,
          image_url: form.image
        })
      });

      const itemData = await itemRes.json();
      if (!itemRes.ok) throw new Error(itemData.error);

      const item_id = itemData.item_id;

      // 2️ Compute auction end time
      const endTime = new Date(Date.now() + Number(form.remainingTime) * 3600000)
        .toISOString();

      // 3️ Create auction entry
      const auctionRes = await fetch("/api/controller/auction/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id,
          seller_id,
          auction_type: form.auctionType === "Forward" ? "FORWARD" : "DUTCH",
          start_price: Number(form.price),
          current_price: Number(form.price),

          end_time: endTime,

          // FORWARD ignores Dutch fields
          reserve_price:
            form.auctionType === "Dutch"
              ? Number(form.reservePrice)
              : null,

          price_drop_step:
            form.auctionType === "Dutch"
              ? Number(form.priceDropStep)
              : null,

          step_interval_sec:
            form.auctionType === "Dutch"
              ? Number(form.priceDropIntervalSec)
              : null,

          shipping_price: Number(form.shippingPrice),
          expedited_price: Number(form.expeditedPrice),
          shipping_days: Number(form.shippingDays)
        })
      });

      const auctionData = await auctionRes.json();
      if (!auctionRes.ok) throw new Error(auctionData.error);

      alert("Item + Auction created in DB!");
      window.location.href = "/browse-auctions";

    } catch (err) {
      console.error("DB ERROR:", err);
      alert(err.message);
    }
  }
  */

  return (
    <div className={styles.outer}>
      <div className={styles.card}>
        <h1 className={styles.title}>
          {editing ? "Edit Item" : "Add New Item"}
        </h1>

        {/* NAME */}
        <label className={styles.label}>Item Name</label>
        <input
          name="name"
          className={styles.input}
          value={form.name}
          onChange={handleChange}
          placeholder="Example: Gucci Handbag"
        />

        {/* DESCRIPTION */}
        <label className={styles.label}>Description</label>
        <textarea
          name="description"
          className={styles.textarea}
          value={form.description}
          onChange={handleChange}
          placeholder="Describe the item..."
        />

        {/* STARTING PRICE */}
        <label className={styles.label}>Starting Price ($)</label>
        <input
          name="price"
          type="number"
          className={styles.input}
          value={form.price}
          onChange={handleChange}
        />

        {/* AUCTION TYPE */}
        <label className={styles.label}>Auction Type</label>
        <select
          name="auctionType"
          className={styles.input}
          value={form.auctionType}
          onChange={handleChange}
        >
          <option value="">Select</option>
          <option value="Forward">Forward Auction</option>
          <option value="Dutch">Dutch Auction</option>
        </select>

        {/* DURATION */}
        <label className={styles.label}>Duration (hours)</label>
        <input
          name="remainingTime"
          type="number"
          className={styles.input}
          value={form.remainingTime}
          onChange={handleChange}
        />

        {/* DUTCH FIELDS */}
        {form.auctionType === "Dutch" && (
          <>
            <label className={styles.label}>Reserve Price</label>
            <input
              name="reservePrice"
              type="number"
              className={styles.input}
              value={form.reservePrice}
              onChange={handleChange}
            />

            <label className={styles.label}>Price Drop Step ($)</label>
            <input
              name="priceDropStep"
              type="number"
              className={styles.input}
              value={form.priceDropStep}
              onChange={handleChange}
            />

            <label className={styles.label}>Drop Interval (seconds)</label>
            <input
              name="priceDropIntervalSec"
              type="number"
              className={styles.input}
              value={form.priceDropIntervalSec}
              onChange={handleChange}
            />
          </>
        )}

        {/* SHIPPING */}
        <label className={styles.label}>Shipping Price ($)</label>
        <input
          name="shippingPrice"
          type="number"
          className={styles.input}
          value={form.shippingPrice}
          onChange={handleChange}
        />

        <label className={styles.label}>Expedited Shipping Extra ($)</label>
        <input
          name="expeditedPrice"
          type="number"
          className={styles.input}
          value={form.expeditedPrice}
          onChange={handleChange}
        />

        <label className={styles.label}>Shipping Time (days)</label>
        <input
          name="shippingDays"
          type="number"
          className={styles.input}
          value={form.shippingDays}
          onChange={handleChange}
        />

        {/* IMAGE */}
        <label className={styles.label}>Image URL</label>
        <input
          name="image"
          className={styles.input}
          value={form.image}
          onChange={handleChange}
          placeholder="https://example.com/item.jpg"
        />

        {/* BUTTONS */}
        <button className={styles.saveBtn} onClick={handleSubmit}>
          {editing ? "Save Changes" : "Add Item"}
        </button>

        {editing && (
          <button
            className={styles.deleteBtn}
            onClick={() => {
              let items = JSON.parse(localStorage.getItem("ddj-items") || "[]");
              items = items.filter((i) => i.id !== form.id);
              localStorage.setItem("ddj-items", JSON.stringify(items));
              sessionStorage.removeItem("editing-item");
              alert("Item deleted!");
              window.location.href = "/browse-auctions";
            }}
          >
            Delete Item
          </button>
        )}
      </div>
    </div>
  );
}
