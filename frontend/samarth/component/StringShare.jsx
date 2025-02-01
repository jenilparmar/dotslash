"use client";
import { useState } from "react";
import { contractAddress, provider } from "../../utils/connectchain";
import { Contract } from "ethers";
import ABI from "../../../artifacts/contracts/Lock.sol/Lock.json";

export default function StringShare() {
  const [string, setString] = useState("");

  const handleSubmit = async () => {
    if (!string) {
      alert("Please enter a string before submitting.");
      return;
    }

    try {
      let signature = await provider.getSigner();
      let contract = new Contract(contractAddress, ABI.abi, signature);
      await contract.addConnectionString(string);
      alert("String submitted successfully!");
    } catch (error) {
      alert("Error submitting string: " + error.message);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-center mb-4">
        Submit Your String
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          value={string}
          onChange={(e) => setString(e.target.value)}
          placeholder="Write your string here"
          className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-indigo-500 text-white py-3 rounded-md hover:bg-indigo-600 transition duration-200"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
