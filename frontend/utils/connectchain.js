import { Contract, ethers } from "ethers";

let provider;
let contractAddress = "0x77AD263Cd578045105FBFC88A477CAd808d39Cf6";
if (typeof window !== "undefined" && window.ethereum) {
  provider = new ethers.BrowserProvider(window.ethereum);
}

async function connectWallet() {
  if (!provider) {
    console.error("Ethereum provider not available.");
    return;
  }

  try {
    await provider.send("eth_requestAccounts", []);
  } catch (err) {
    console.error("Error in connecting wallet:", err);
  }
}

export { provider, connectWallet, contractAddress };
