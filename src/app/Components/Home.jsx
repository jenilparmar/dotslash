import React from "react";
import { Pixelify_Sans } from "next/font/google";

const pixelFont = Pixelify_Sans({
  weight: "400",
  subsets: ["latin"],
});

const Home = () => {
  return (
    <div className={`${pixelFont.className} self-center h-1/3 `}>
      <p className="custom-font text-9xl text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 animate-gradient">CRUD-LINGO</p>
    </div>
  );
};

export default Home;
