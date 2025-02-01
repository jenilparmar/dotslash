import { Pixelify_Sans } from "next/font/google";
import "./globals.css"; // Ensure this file is imported
import Home from "./Components/Home";
const pixelFont = Pixelify_Sans({
  weight: "400",
  subsets: ["latin"],
});

export default function page() {
  return (
   <>
    <div className="h-screen w-full flex flex-col justify-center">
    <Home></Home>
    
    </div>
   </>
  );
}
