"use client";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function ClientLayout({ children }) {
  return (
    <>
      <Navbar />

      <div style={{ minHeight: "80vh" }}>
        {children}
      </div>

      <Footer />
    </>
  );
}
