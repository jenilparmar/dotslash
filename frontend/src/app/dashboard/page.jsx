"use client";
import { Contract } from "ethers";
import ChatGPTInterface from "../../../samarth/Dash";
import { contractAddress, provider } from "../../../utils/connectchain";
import ABI from "../../../../artifacts/contracts/Lock.sol/Lock.json";
import { generateRandom } from "../../../utils/generateRandom";

export default function Dashboard() {
  return (
    <>
      {/* <div>
        <button
          onClick={async () => {
            let rand = generateRandom();
            console.log(rand);
          }}
        >
          View
        </button>
      </div> */}
      <ChatGPTInterface />
    </>
  );
}
