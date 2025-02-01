"use client";
import React, { useEffect, useState } from "react";
import { parseQuery } from "./ExtraFuncation_Jenil/Read_Condition_based";
import Sideelement from "./component/Sideelement";
import { contractAddress, provider } from "../utils/connectchain";
import { Contract, Transaction } from "ethers";
import ABI from "../../artifacts/contracts/Lock.sol/Lock.json";
import { ExtractDataFromPara } from "@/app/api/InsertData/ExtractDataFromInsert";
import Databases from "./component/Databases";
import { generateRandom } from "../utils/generateRandom";
import Image from "next/image";
import { set } from "rsuite/esm/internals/utils/date";
const uri = "mongodb://localhost:27017/";

const ChatGPTInterface = () => {
  let [add, setAdd] = useState("");
  const [dbs, setDbs] = useState([
    { name: "Localhost", url: "mongodb://localhost:27017/" },
  ]);
  const [messages, setMessages] = useState(() => []);
  const [input, setInput] = useState("");
  const [allDatabases, setAllDatabase] = useState([]);
  const [anotherData, setAnotherData] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [workinguri, setWorkingUri] = useState(`mongodb://localhost:27017/`);
  const [nameOfOwner, setNameOfOwner] = useState("");
  const [readDataOperation, setReadDataOperation] = useState({
    response: [],
    flag: false,
  });
  const [hydrated, setHydrated] = useState(false);
  const [generalOperation, setGeneralOpeeration] = useState({
    response: "",
    flag: false,
  });
  useEffect(() => {
    async function getDbs(uri) {
      const data = {
        MongoDbUri: uri,
      };

      try {
        const res = await fetch("/api/CheckDb", {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!res.ok) {
          throw new Error("Failed to fetch databases");
        }

        const responseData = await res.json();
        console.log("Response Data:", responseData); // Log the response to debug
        const databases = responseData["databases"];
        setAllDatabase(databases["databases"]);
      } catch (error) {
        console.error("Error fetching databases:", error);
      }
    }

    // Replace with your MongoDB URI
    getDbs(uri);
  }, []);
  useEffect(() => {
    setHydrated(true);
  }, []);

  //function to handle send
  const handleSend = async () => {
    // setMessages(input)
    const uri = workinguri;
    const data = {
      paragraph: input,
    };
    setLoading(true);
    const res = await fetch("http://192.168.1.14:5000/getIntent", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setLoading(false);
    const response = await res.json();
    const dbName = ("" + response["DB_info"]).split(/[\s,]+/)[0];
    const colName = response["DB_info"].split(/[\s,]+/)[1];
    let intent = ("" + response.intent).toLowerCase();
    if (intent === "read") {
      console.log("In Read All Data Mode!!");
      setReadDataOperation(true);
      const QueryDone = await fetch("/api/ReadAllData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfDB: dbName,
          nameOfCollection: colName,
          MongoDbUri: uri,
        }),
      });
      // .then((response) => response.json())
      // .then((data) => console.log(data))  // Log the response data
      // .catch((error) => console.error('Error:', error));

      const data = await QueryDone.json();
      setReadDataOperation({
        response: data.data, // Assuming the response contains a "data" key
        flag: true,
      });
    } else if (intent == "CREATE".toLowerCase()) {
      console.log("In Create Mode!");

      const QueryDone = await fetch("/api/createdb", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfDB: dbName,
          nameOfCollection: colName,
          dataInArray: [{ parmar: "jenil" }], // Example data to insert
          MongoDbUri: uri,
        }),
      });
      const data = await QueryDone.json();
      setReadDataOperation(false);

      setGeneralOpeeration({
        flag: true,
        response: "Done Creation Operation!!",
      });

      // .then((response) => response.json())
      // .then((data) => console.log(data))  // Log the response data
      // .catch((error) => console.error('Error:', error));
    } else if (intent == "UPDATE".toLowerCase()) {
      console.log("In Update Mode!!!!");
      const filter = parseQuery(input);
      const QueryDone = await fetch("/api/Update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfDB: dbName,
          nameOfCollection: colName,
          atrs: filter,
          MongoDbUri: uri,
          changeAtrs: [{ name: "jenil" }, { age: 20 }],
        }),
      });
      const data = await QueryDone.json();
      setReadDataOperation(false);
      setGeneralOpeeration({
        flag: true,
        response: data["message"],
      });
    } else if (intent == "DELETE".toLowerCase()) {
      console.log("In Whole Collection Delete Mode!");

      const QueryDone = await fetch("/api/DeleteCollection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfDB: dbName,
          nameOfCollection: colName,
          MongoDbUri: uri,
        }),
      });
      const data = await QueryDone.json();
      setReadDataOperation(false);

      setGeneralOpeeration({
        flag: true,
        response: data["message"],
      });
      let signature = await provider.getSigner();
      console.log(signature);
      console.log("address->", await signature.getAddress());
      let contract = new Contract(contractAddress, ABI.abi, signature);
      console.log(contract);
      let random = generateRandom();
      await contract.uploadByOur(
        input,
        `${data["message"]} entries Inseted In DB!!`,
        "update",
        `${random}`
      );
    } else if (intent == "DELETE_CONDITIONED_BASED".toLowerCase()) {
      console.log("In Delete Condition based!!!");
      // give me the data whose name hogaya and age is <=19 from database name jenil and collection name pamrar
      const filter = parseQuery(input);

      const QueryDone = await fetch("/api/DeleteConditionBased", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfDB: dbName,
          nameOfCollection: colName,
          atrs: filter,
          MongoDbUri: uri,
        }),
      });
      const data = await QueryDone.json();
      setReadDataOperation(false);

      setGeneralOpeeration({
        response: `${data["deletedCount"]} entries deleted!!`,
        flag: true,
      });
      let signature = await provider.getSigner();
      console.log(signature);
      console.log("address->", await signature.getAddress());
      let contract = new Contract(contractAddress, ABI.abi, signature);
      console.log(contract);
      const random = window.crypto.randomUUID().replace(/-/g, "").slice(0, 16);
      console.log(random);
      // yahaa seee insert karvanaaa haii mujhe ye dataaa mere db mnaiiiiii
      console.log("this is data in delete----->", data["data"]);
      const res = await fetch("/api/inserDeleted", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: data["data"],
          hash: random,
        }),
      });
      console.log(
        "---->",
        "delted condition based",
        contract,
        input,
        `${data["deletedCount"]} entries deleted In DB!!`,
        `${random}`
      );
      await contract.uploadByOur(
        input,
        `${data["deletedCount"]} entries deleted In DB!!`,
        "delete",
        `${random}`
      );
    } else if (intent == "READ_CONDITION_BASED_DATA".toLowerCase()) {
      console.log("IN Read condition data");

      // Extract filter conditions from the input
      const filter = parseQuery(input);

      try {
        const res = await fetch("/api/ReadConditionBased", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nameOfDB: dbName,
            nameOfCollection: colName,
            atrs: filter, // Query conditions
            MongoDbUri: uri,
          }),
        });

        // Await the JSON response
        const data = await res.json();
        // console.log(data);
        //
        // Set the response data to state
        setReadDataOperation({
          response: data.data, // Assuming the response contains a "data" key
          flag: true,
        });

        // For debugging the API response
      } catch (error) {
        console.error("Error:", error);
      }
    } else {
      console.log("In Insert Data Mode!!!");
      const dataToInsert = ExtractDataFromPara(input);
      const QueryDone = await fetch("/api/InsertData", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nameOfDB: dbName,
          nameOfColletion: colName,
          data: dataToInsert, // Query conditions
          MongodbUri: uri,
        }),
      });
      const data = await QueryDone.json();
      setReadDataOperation(false);

      setGeneralOpeeration({
        response: `${data["insertedCount"]} entries Inseted In DB!!`,
        flag: true,
      });
      console.log(
        "----->",

        `${data["insertedCount"]} entries Inseted In DB!!`
      );
      let signature = await provider.getSigner();
      console.log(signature);
      console.log("address->", await signature.getAddress());
      let contract = new Contract(contractAddress, ABI.abi, signature);
      console.log(contract);
      let random = generateRandom();
      await contract.uploadByOur(
        input,
        `${data["insertedCount"]} entries Inseted In DB!!`,
        "insert",
        `${random}`
      );
      // await contract.uploadByOur(
      //   input,
      //   `"2 entries Inseted In DB!!"`,
      //   "insert"
      // );
    }
    // let signature = await provider.getSigner();
    // console.log(signature);
    // console.log("address->", await signature.getAddress());
    // let contract = new Contract(contractAddress, ABI.abi, signature);
    // console.log(contract);
    // await contract.uploadByOur(input, "this is my first data");
  };

  useEffect(() => {
    console.log(loading ? "loading" : "done");
  }, [loading]);
  if (!hydrated) return null;

  return (
    <div
      className={`flex flex-row h-screen ${
        isDarkMode ? "bg-black text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* <div>
        <button
          onClick={async () => {
            let signature = await provider.getSigner();
            console.log(signature);
            console.log("address->", await signature.getAddress());
            let contract = new Contract(contractAddress, ABI.abi, signature);
            console.log(contract);
            console.log("hello");
            let res = await contract.uploadByOur(
              "hello",
              "its samarth",
              "insert data here"
            );
          }}
        >
          view
        </button>
        <button
          onClick={async () => {
            let signature = await provider.getSigner();
            console.log(signature);
            console.log("address->", await signature.getAddress());
            let contract = new Contract(contractAddress, ABI.abi, signature);
            console.log(contract);
            let res = await contract.viewUserItsellf();
            console.log(res);
          }}
        >
          {" "}
          history{" "}
        </button>
      </div> */}
      <div className="flex flex-col justify-between ">
        <div className="flex flex-row h-full">
          <div className="w-fit border-r-2 border-[#292929]  px-4">
            <h1
              className={`font-semibold text-[#e6e0e0] text-center my-5 ${
                workinguri === "mongodb://localhost:27017/"
                  ? "bg-[#292929]"
                  : ""
              } `}
              onClick={() => {
                setWorkingUri("mongodb://localhost:27017/");
              }}
            >
              local host Database
            </h1>

            <ul className="gap-2 flex flex-col">
              {allDatabases && allDatabases.length > 0 ? (
                allDatabases.map((db, index) => (
                  <li
                    className="w-full px-5 py-2 text-sm bg-[#292929] rounded-2xl text-center hover:bg-[#626262] hover:scale-105 transition-all duration-100"
                    key={index}
                  >
                    {db["name"]}
                  </li>
                ))
              ) : (
                <p>No databases found.</p>
              )}
            </ul>
          </div>
          <div className="w-fit border-r-2 border-[#292929]  px-4">
            <h1
              className={`font-semibold text-[#e6e0e0] text-center my-5 ${
                workinguri != "mongodb://localhost:27017/" ? "bg-[#292929]" : ""
              }
              }`}
              onClick={() => {
                setWorkingUri();
              }}
            >
              another database
            </h1>
            <ul className="gap-2 flex flex-col">
              {anotherData && anotherData.length > 0 ? (
                anotherData.map((db, index) => (
                  <li
                    className="w-full px-5 py-2 text-sm bg-[#292929] rounded-2xl text-center hover:bg-[#626262] hover:scale-105 transition-all duration-100"
                    key={index}
                  >
                    {db["name"]}
                  </li>
                ))
              ) : (
                <p>No databases found.</p>
              )}
            </ul>
          </div>
        </div>

        <div className="flex flex-col px-2 items-center space-y-4 p-1 border-2 border-[#292929]">
          <h2 className="text-xl text-center text-white">Connect to MongoDB</h2>
          <input
            type="text"
            placeholder="Enter MongoDB Connection String"
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "bg-[#292929] text-white focus:ring-[#1a166d]"
                : "bg-gray-100 text-black focus:ring-[#1a166d]"
            }`}
            onChange={(e) => setAdd(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter Name of Owner"
            className={`px-4 py-2 rounded-lg focus:outline-none focus:ring-2 ${
              isDarkMode
                ? "bg-[#292929] text-white focus:ring-[#1a166d]"
                : "bg-gray-100 text-black focus:ring-[#1a166d]"
            }`}
            onChange={(e) => setNameOfOwner(e.target.value)}
          />
          <button
            onClick={async () => {
              try {
                const signature = await provider.getSigner();
                const address = await signature.getAddress();

                console.log("address->", address);

                const contract = new Contract(
                  contractAddress,
                  ABI.abi,
                  signature
                );
                const res = await contract.viewConnectionString(add);
                setWorkingUri(res);
                console.log("Contract Response: ", res);

                // Call the Next.js API to connect to MongoDB
                const response = await fetch("/api/connectDb", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    connectionString: res, // String obtained from the contract
                  }),
                });

                const result = await response.json();
                if (response.ok) {
                  console.log("Data from MongoDB:", result.databases);
                  setAnotherData(result.databases);
                  if (!res && !nameOfOwner) {
                    setDbs((prev) => [
                      ...prev,
                      { name: nameOfOwner, url: res },
                    ]);
                  }
                } else {
                  console.error("API Error:", result.error);
                }
              } catch (error) {
                console.error("Error:", error.message);
              }
            }}
            className="px-4 w-full py-2 rounded-lg cs"
          >
            Connect
          </button>
        </div>
      </div>
      {/* Chat Messages */}
      <div className="w-full h-screen flex flex-col justify-between">
        <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 justify-center">
          {!loading &&
            readDataOperation.flag &&
            readDataOperation.response.map((obj, index) => (
              <div
                key={index}
                className="p-4 border rounded-lg bg-[#292929] text-white"
              >
                <pre>{JSON.stringify(obj, null, 2)}</pre>
              </div>
            ))}
          {generalOperation.flag && (
            <>
              <p className="text-green-500 text-6xl font-bold self-center">
                {generalOperation.response}
              </p>
            </>
          )}
          {loading && (
            <>
              <img
                className="self-center opacity-80"
                src="https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExMXlwdG4xYXExMmNuOWFpc2hveWdrMnZqMzdmMjhoNG50M2ZtdWE0NCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/tAjb5pyCEBhEb8jWxC/giphy.gif"
                height="200"
                width="250"
                alt="GIF"
              />
            </>
          )}
        </div>

        {/* Input Field */}
        <div
          className={`p-4 border-t ${
            isDarkMode ? "border-[#292929] " : "border-gray-300 bg-white"
          }`}
        >
          <div className="w-full flex items-center space-x-3 ">
            <div className="card w-full hover:p-1">
              <input
                type="text"
                className={` card2 h-3 w-full flex-1  px-4 py-10  focus:outline-none focus:ring-2 ${
                  isDarkMode
                    ? "bg-[#292929] text-white focus:ring-[#787d81]"
                    : "bg-gray-100 text-black focus:ring-blue-400"
                }`}
                placeholder="Kindly Type Your Query"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />
            </div>
            <button
              className={`cs px-4 py-2 rounded-lg `}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault(); // Prevent unexpected default actions
                  handleSend();
                }
              }}
              onClick={handleSend}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatGPTInterface;
