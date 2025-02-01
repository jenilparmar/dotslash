import { Contract, ethers } from "ethers";

let provider;
let contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
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
