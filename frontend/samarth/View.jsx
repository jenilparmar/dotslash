"use client";
import React, { useEffect, useState } from "react";
import { contractAddress, provider } from "../utils/connectchain";
import Card from "./component/card";
import { Contract } from "ethers";
import ABI from "../../artifacts/contracts/Lock.sol/Lock.json";

const View = () => {
  const [addres, setAddres] = useState("");
  const [response, setResponse] = useState([]);
  const [anotherres, setAnotherres] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        let signature = await provider.getSigner();
        let contract = new Contract(contractAddress, ABI.abi, signature);
        let res = await contract.viewUserItsellf();

        setResponse(
          res.map((e) => ({
            userStatement: e[0],
            queryPoint: e[1],
            intent: e[2],
            transaction: e[3],
            dbName: e[4],
            collectionName: e[5],
            uri: e[6],
          }))
        );
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };
    fetchHistory();
  }, []);

  const handleSubmit = async () => {
    if (addres.trim() === "") {
      alert("Please enter an address.");
      return;
    }
    try {
      let signature = await provider.getSigner();
      let contract = new Contract(contractAddress, ABI.abi, signature);
      let res = await contract.viewAll(addres);

      setAnotherres(
        res.map((e) => ({
          userStatement: e[0],
          queryPoint: e[1],
          intent: e[2],
          transaction: e[3],
          dbName: e[4],
          collectionName: e[5],
          uri: e[6],
        }))
      );
    } catch (error) {
      console.error("Error fetching data for address:", error);
    }
  };

  return (
    <div className="bg-gray-900 min-h-screen flex flex-col items-center py-10 text-white">
      {/* Input and Button Section */}
      <div className="flex gap-4 mb-6">
        <input
          type="text"
          className="h-10 w-72 px-3 text-black rounded-md outline-none border border-gray-400"
          placeholder="Enter address..."
          value={addres}
          onChange={(e) => setAddres(e.target.value)}
        />
        <button
          className="h-10 px-5 bg-gradient-to-r from-green-500  to-blue-500  rounded-md  transition-all"
          onClick={handleSubmit}
        >
          Submit
        </button>
      </div>

      {/* Response Cards */}
      {response.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Your Transactions
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {response.map((res, idx) => {
              return (
                <Card
                  key={idx}
                  statement={res.userStatement}
                  query={res.queryPoint}
                  intent={res.intent}
                  transaction={res.transaction}
                  dbName={res.dbName}
                  collectionName={res.collectionName}
                  uri={res.uri}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Divider Line */}
      {response.length > 0 && anotherres.length > 0 && (
        <hr className="w-3/4 my-8 border-t-2 border-gray-600" />
      )}

      {/* Another Response Cards */}
      {anotherres.length > 0 && (
        <div className="w-full max-w-4xl">
          <h2 className="text-xl font-semibold mb-4 text-center">
            Searched Transactions
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            {anotherres.map((res, idx) => (
              <Card
                key={idx}
                statement={res.userStatement}
                query={res.queryPoint}
                intent={res.intent}
                transaction={res.transaction}
                dbName={res.dbName}
                collectionName={res.collectionName}
                uri={res.uri}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default View;
