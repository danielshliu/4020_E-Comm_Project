import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export const metadata = {
  title: "DDJ Auctions",
  description: "Online Auction Platform",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="layoutContainer">
        <Navbar />
        <main className="layoutMain">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
