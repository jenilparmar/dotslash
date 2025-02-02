"use client";
import { useState } from "react";
import { contractAddress, provider } from "../../utils/connectchain";
import { Contract } from "ethers";
import ABI from "../../../artifacts/contracts/Lock.sol/Lock.json";

export default function StringShare() {
  const [string, setString] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!string.trim()) {
      alert("Please enter a valid string before submitting.");
      return;
    }

    setLoading(true);
    try {
      let signature = await provider.getSigner();
      let contract = new Contract(contractAddress, ABI.abi, signature);
      await contract.addConnectionString(string);
      alert("String submitted successfully!");
      setString("");
    } catch (error) {
      alert("Error submitting string: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-gray-50 shadow-lg rounded-xl border border-gray-200">
      <h2 className="text-3xl font-semibold text-center text-gray-800 mb-5">
        Submit Your String
      </h2>
      <div className="space-y-5">
        <input
          type="text"
          value={string}
          onChange={(e) => setString(e.target.value)}
          placeholder="Enter your string..."
          className="w-full p-3 border border-gray-400 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSubmit}
          disabled={loading}
          className={`w-full py-3 rounded-lg text-white transition duration-200 ${
            loading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </div>
    </div>
  );
}
