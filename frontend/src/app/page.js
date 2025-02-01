"use client";
import { provider, connectWallet } from "../../utils/connectchain";
import { useEffect, useState } from "react";
import ABI from "../../../artifacts/contracts/Lock.sol/Lock.json";
import { Contract, Signature } from "ethers";
import { Pixelify_Sans } from "next/font/google";
import "./globals.css"; // Ensure this file is imported
import Home from "../../samarth/component/Home";
import Navbar from "../../samarth/component/Navbar";

export default function Page() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const getContract = async () => {
    const signer = await provider.getSigner();
    return new Contract(contractAddress, ABI.abi, signer);
  };

  const transferByGivingAddress = async () => {
    try {
      const contract = await getContract();
      console.log("Current Block Number:", await provider.getBlockNumber());

      const tx = await contract.upload(
        "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
        "hel",
        "chut ke pille",
        {
          gasLimit: 10000000,
        }
      );

      console.log("Transaction Sent:", tx);
      const receipt = await tx.wait();
      console.log("Transaction Confirmed:", receipt);
    } catch (err) {
      console.error("Error in upload function:", err);
    }
  };
  const transferOwn = async () => {
    try {
      const contract = await getContract();
      console.log("Current Block Number:", await provider.getBlockNumber());

      const tx = await contract.uploadByOur("up", "uploadbyour", {
        gasLimit: 10000000,
      });

      console.log("Transaction Sent:", tx);
      const receipt = await tx.wait();
      console.log("Transaction Confirmed:", receipt);
    } catch (err) {
      console.error("Error in upload function:", err);
    }
  };

  // View all content
  const viewAll = async () => {
    try {
      const contract = await getContract();
      const result = await contract.viewAll(
        "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"
      );
      console.log("View All Result:", result);
    } catch (err) {
      console.error("Error in viewAll function:", err);
    }
  };
  const viewAllByUser = async () => {
    try {
      const signer = await provider.getSigner();
      let add = signer.getAddress();
      console.log("userAddress->", add);
      const contract = await getContract();
      const result = await contract.viewUserItsellf(add);
      console.log("View All Result:", result);
    } catch (err) {
      console.error("Error in viewAll function:", err);
    }
  };

  // Add permission
  const addPermission = async () => {
    try {
      const contract = await getContract();
      const signer = await provider.getSigner();
      console.log(await signer.getAddress());
      const tx = await contract.addPermission(
        "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"
      );
      console.log("Permission Transaction Sent:", tx);
      const receipt = await tx.wait();
      console.log("Permission Confirmed:", receipt);
    } catch (err) {
      console.error("Error in addPermission function:", err);
    }
  };

  // Initialize wallet connection on component mount
  useEffect(() => {
    const connect = async () => {
      await connectWallet();
    };
    connect();
  }, []);

  return (
    <div className="h-screen w-full flex-col flex  justify-center ">
      <Navbar/>
      <Home></Home>
    </div>
  );
}
