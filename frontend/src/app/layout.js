import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "../../samarth/component/Navbar";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        {children}
      </body>
    </html>
  );
}
