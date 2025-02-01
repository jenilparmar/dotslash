"use client";
import React, { useEffect, useState } from "react";
import { contractAddress, provider } from "../utils/connectchain";
import Card from "./component/card";
import { Contract } from "ethers";
import ABI from "../../artifacts/contracts/Lock.sol/Lock.json";

const View = () => {
  let [response, setResponse] = useState([]);
  useEffect(() => {
    let fetchHistory = async () => {
      let signature = await provider.getSigner();
      let add = await signature.getAddress();
      let contract = new Contract(contractAddress, ABI.abi, signature);
      let res = await contract.viewUserItsellf();

      console.log(res);
      res.map((e) => {
        console.log(e[0]);
        setResponse((prev) => {
          return prev.concat({
            userStatement: e[0],
            queryPoint: e[1],
            intent: e[2],
            transaction: e[3],
            time: e[4],
          });
        });
      });
    };
    fetchHistory();
  }, []);
  return (
    <div className="bg-gray-900 min-h-screen max-h-fit flex flex-wrap  justify-evenly gap-x-14">
      {response &&
        response.map((res, idx) => {
          return (
            <div className="min-w-52 " key={idx}>
              <button
                onClick={() => {
                  console.log(response);
                }}
              >
                view
              </button>
              <Card
                statement={res.userStatement}
                query={res.queryPoint}
                intent={res.intent}
                transaction={res.transaction}
                time={res.time}
              ></Card>
            </div>
          );
        })}
    </div>
  );
};

export default View;
