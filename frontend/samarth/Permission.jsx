"use client";
import { useState } from "react";
import { provider } from "../utils/connectchain";
import { Contract } from "ethers";
import ABI from "../../artifacts/contracts/Lock.sol/Lock.json";

export default function Perm() {
  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  const fetchContract = async () => {
    const signer = await provider.getSigner();
    let contract = new Contract(contractAddress, ABI.abi, signer);
    return contract;
  };

  const [address, setAddress] = useState({ address: "", name: "" });
  const [userAllowed, setUserAllowed] = useState([]);

  return (
    <div className="bg-black min-h-screen flex flex-col items-center p-8">
      <h1 className="text-3xl font-bold text-white mb-8">
        Permission Management
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        {/* Add Permission Section */}
        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Add Permission
          </h2>
          <div className="flex flex-col gap-4">
            <input
              className="border border-gray-600 bg-gray-900 rounded-lg p-3 text-white focus:outline-none focus:ring focus:ring-blue-400"
              type="text"
              placeholder="Enter address"
              required
              onChange={(e) =>
                setAddress({ ...address, address: e.target.value })
              }
            />
            <input
              className="border border-gray-600 bg-gray-900 rounded-lg p-3 text-white focus:outline-none focus:ring focus:ring-blue-400"
              type="text"
              placeholder="Enter name"
              required
              onChange={(e) => setAddress({ ...address, name: e.target.value })}
            />
            <button
              className="bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
              onClick={async () => {
                let contract = await fetchContract();
                let res = await contract?.addPermission(
                  address.address,
                  address.name
                );
                if (res) {
                  alert("Permission added successfully");
                } else {
                  alert("Permission not added");
                }
              }}
            >
              Add Permission
            </button>
          </div>
        </div>

        {/* View Permission Section */}
        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            View Permissions
          </h2>
          <button
            className="bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 mb-4"
            onClick={async () => {
              let contract = await fetchContract();
              let res = await contract.sharedAccessWith();
              setUserAllowed(
                res.map((item, index) =>
                  index % 2 === 0
                    ? { type: "Address", value: item.toString() }
                    : { type: "Name", value: item.toString() }
                )
              );
            }}
          >
            Load Permissions
          </button>
          <ul className="divide-y divide-gray-700">
            {userAllowed.length > 0 ? (
              userAllowed.map((item, index) => (
                <li key={index} className="py-2 text-gray-300">
                  <span className="font-semibold text-white">{item.type}:</span>{" "}
                  {item.value}
                </li>
              ))
            ) : (
              <li className="py-2 text-gray-500">
                No permissions granted yet.
              </li>
            )}
          </ul>
        </div>

        {/* Remove Permission Section */}
        <div className="bg-gray-800 shadow-md rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Remove Permission
          </h2>
          <div className="flex flex-col gap-4">
            <input
              className="border border-gray-600 bg-gray-900 rounded-lg p-3 text-white focus:outline-none focus:ring focus:ring-red-400"
              type="text"
              placeholder="Enter address to remove"
              required
              onChange={(e) =>
                setAddress((prev) => ({ ...prev, address: e.target.value }))
              }
            />
            <button
              className="bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
              onClick={async () => {
                let contract = await fetchContract();
                let res = await contract.removeAccess(address.address);
                if (res) {
                  alert("Permission removed successfully");
                } else {
                  alert("Permission not removed");
                }
              }}
            >
              Remove Permission
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
