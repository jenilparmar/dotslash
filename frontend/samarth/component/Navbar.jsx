import React from "react";
import { Pixelify_Sans } from "next/font/google";
import Link from "next/link";
const pixelFont = Pixelify_Sans({
  weight: "400",
  subsets: ["latin"],
});

const Navbar = () => {
  return (
    <div className="fixed top-0 w-full h-20 flex flex-row justify-between px-6 items-center ">
      {/* Brand Name */}
      <div
        className={`${pixelFont.className} text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500`}
      >
        CRUD-LINGO
      </div>

      <ul className="flex flex-row space-x-6">
        <Link href="/dashboard" prefetch={true}>
          <li className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:scale-105 transition-transform">
            Dashboard
          </li>
        </Link>
        <Link href="/viewhistory">
          <li className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:scale-105 transition-transform">
            View History
          </li>
        </Link>
        <Link href="/permission">
          <li className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:scale-105 transition-transform">
            Permission
          </li>
        </Link>
        <Link href="/stringshare">
          <li className="cursor-pointer text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 hover:scale-105 transition-transform">
            Share Connection
          </li>
        </Link>
      </ul>
    </div>
  );
};

export default Navbar;
