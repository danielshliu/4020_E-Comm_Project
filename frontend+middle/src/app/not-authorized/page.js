"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import Hero from "../../components/Hero";
import Auctions from "../../components/Auctions";
import Catalogue from "../../components/Catalogue";
import HowItWorks from "../../components/HowItWorks";
import Welcome from "../../components/Welcome";

export default function NotAuthorizedPage() {
  return (
    <div style={{ padding: 40 }}>
      <h1 style={{ fontSize: "32px", fontWeight: "700", marginBottom: "20px" }}>
        Not Authorized
      </h1>
      <p>You must be logged in to access this page.</p>
    </div>
  );
}
