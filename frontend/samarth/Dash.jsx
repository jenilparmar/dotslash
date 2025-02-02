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
import Navbar from "./component/Navbar";
import { hash } from "crypto";
const uri = "mongodb://localhost:27017/";

const ChatGPTInterface = () => {
  let [add, setAdd] = useState("");
  const [dbs, setDbs] = useState([
    { name: "Localhost", url: "mongodb://localhost:27017/" },
  ]);
  let [uris, setUris] = useState("mongodb://localhost:27017/");
  const [messages, setMessages] = useState(() => []);
  const [input, setInput] = useState("");
  const [allDatabases, setAllDatabase] = useState([]);
  const [anotherData, setAnotherData] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [workinguri, setWorkingUri] = useState(`mongodb://localhost:27017/`);
  const [nameOfOwner, setNameOfOwner] = useState("");
  const [creds, setCreds] = useState({
    dbName: "jenil",
    colName: "parmar",
  });
  const [readDataOperation, setReadDataOperation] = useState({
    response: [],
    flag: false,
  });
  const [hydrated, setHydrated] = useState(false);
  const [generalOperation, setGeneralOpeeration] = useState({
    response: "",
    flag: false,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCreds((prev) => ({
      ...prev, // Keep existing values
      [name]: value, // Update only the targeted input field
    }));
  };
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
    const res = await fetch("http://172.16.44.183:5000/getIntent", {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    });
    setLoading(false);
    const response = await res.json();
    // const dbName = ("" + response["DB_info"]).split(/[\s,]+/)[0];
    const dbName = creds.dbName;
    // const colName = response["DB_info"].split(/[\s,]+/)[1];
    const colName = creds.colName;
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
          MongoDbUri: workinguri,
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
          MongoDbUri: workinguri,
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
      try {
        console.log("In Update Mode!!!!");
        const filter = parseQuery(input);
        const changeArributes = ExtractDataFromPara(input);
        console.log("in updateeee mode;llll-----", changeArributes);

        const random = window.crypto
          .randomUUID()
          .replace(/-/g, "")
          .slice(0, 16);
        const QueryDone = await fetch("/api/Update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nameOfDB: dbName,
            nameOfCollection: colName,
            atrs: filter,
            MongoDbUri: workinguri,
            changeAtrs: changeArributes,
            hash: random,
          }),
        });

        const data = await QueryDone.json();

        if (!QueryDone.ok) {
          throw new Error(data.message || "Update request failed!");
        }

        setReadDataOperation(false);
        setGeneralOpeeration({
          flag: true,
          response: `${data["message"]} entries updated!`,
        });

        if (data["message"] > 0) {
          let signature = await provider.getSigner();
          console.log("Signer Address->", await signature.getAddress());

          let contract = new Contract(contractAddress, ABI.abi, signature);
          console.log(contract);
          console.log(random);

          await contract.uploadByOur(
            input,
            `${data["message"]} entries updated In DB!!`,
            "update",
            `${random}`
          );
        } else {
          alert("No entries found to update!");
        }
      } catch (error) {
        console.error("Error in update operation:", error.message);
      }
    } else if (intent == "DELETE".toLowerCase()) {
      console.log("In Whole Collection Delete Mode!");
      if (
        confirm("Do you want to Delete the Whole Collection??", creds.colName)
      ) {
        const QueryDone = await fetch("/api/DeleteCollection", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nameOfDB: dbName,
            nameOfCollection: colName,
            MongoDbUri: workinguri,
          }),
        });
        const data = await QueryDone.json();
        console.log(data);
        setReadDataOperation(false);

        setGeneralOpeeration({
          flag: true,
          response: data["message"],
        });
      }
    } else if (intent === "DELETE_CONDITIONED_BASED".toLowerCase()) {
      try {
        console.log("Executing Conditional Deletion...");

        // Extract filter conditions from input
        const filter = parseQuery(input);

        // Send request to delete matching entries
        const deleteResponse = await fetch("/api/DeleteConditionBased", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nameOfDB: dbName,
            nameOfCollection: colName,
            atrs: filter,
            MongoDbUri: workinguri,
          }),
        });

        const deleteData = await deleteResponse.json();

        if (!deleteResponse.ok) {
          throw new Error(deleteData.message || "Failed to delete entries.");
        }

        setReadDataOperation(false);
        setGeneralOpeeration({
          response: `${deleteData["deletedCount"]} entries deleted!`,
          flag: true,
        });

        // Generate a unique identifier
        const randomHash = window.crypto
          .randomUUID()
          .replace(/-/g, "")
          .slice(0, 16);
        if (deleteData["deletedCount"] > 0) {
          // Retrieve signer and contract instance
          let signer = await provider.getSigner();
          console.log("Signer Address:", await signer.getAddress());

          let contractInstance = new Contract(contractAddress, ABI.abi, signer);
          console.log("Contract Instance:", contractInstance);

          console.log("Deleted data:", deleteData["data"]);

          // Store deleted data in another collection
          const insertResponse = await fetch("/api/inserDeleted", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              data: deleteData["data"],
              hash: randomHash,
            }),
          });

          if (!insertResponse.ok) {
            throw new Error(
              "Failed to insert deleted data into backup storage."
            );
          }

          console.log(
            "Deletion Summary:",
            contractInstance,
            input,
            `${deleteData["deletedCount"]} entries deleted from DB!`,
            `${randomHash}`
          );

          // Log deletion operation on contract
          await contractInstance.uploadByOur(
            input,
            `${deleteData["deletedCount"]} entries deleted from DB!`,
            "delete",
            randomHash
          );
        } else {
          alert("No entries found to delete!");
        }
      } catch (error) {
        console.error("Error during conditional deletion:", error.message);
      }
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
            MongoDbUri: workinguri,
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
      try {
        console.log("Entering Insert Data Mode...");

        // Extracting data to insert
        const dataToInsert = ExtractDataFromPara(input);

        // Sending insert request
        const insertResponse = await fetch("/api/InsertData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nameOfDB: dbName,
            nameOfColletion: colName,
            data: dataToInsert,
            MongodbUri: workinguri,
          }),
        });

        const insertData = await insertResponse.json();

        if (!insertResponse.ok) {
          throw new Error(insertData.message || "Failed to insert data.");
        }

        setReadDataOperation(false);
        setGeneralOpeeration({
          response: `${insertData["insertedCount"]} entries inserted in DB!`,
          flag: true,
        });

        console.log(
          `Successfully inserted ${insertData["insertedCount"]} entries in DB!`
        );
        if (insertData["insertedCount"] > 0) {
          // Generate a unique identifier
          const randomHash = window.crypto
            .randomUUID()
            .replace(/-/g, "")
            .slice(0, 16);

          // Get signer and contract instance
          let signer = await provider.getSigner();
          console.log("Signer Address:", await signer.getAddress());

          let contractInstance = new Contract(contractAddress, ABI.abi, signer);
          console.log("Contract Instance:", contractInstance);
          console.log("Generated Hash:", randomHash);

          // Upload operation to contract
          await contractInstance.uploadByOur(
            input,
            `${insertData["insertedCount"]} entries inserted in DB!`,
            "insert",
            randomHash
          );
        } else {
          alert("No data inserted!");
        }
      } catch (error) {
        console.error("Error during data insertion:", error.message);
      }
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
    <>
      <div className="flex flex-col justify-start">
        <Navbar />
        <div
          className={`flex flex-row h-screen mt-20 ${
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

                <ul className="h-[26rem] gap-2 flex flex-col overflow-y-scroll">
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
              <div className="w-fit border-r-2 border-[#292929]  px-4 ">
                <h1
                  className={`font-semibold text-[#e6e0e0] text-center my-5 ${
                    workinguri != "mongodb://localhost:27017/"
                      ? "bg-[#292929]"
                      : ""
                  }
              }`}
                  onClick={() => {
                    let signature = provider.getSigner();
                    let contract = new Contract(
                      contractAddress,
                      ABI.abi,
                      signature
                    );
                    if (workinguri == "mongodb://localhost:27017/") {
                      if (uris == "mongodb://localhost:27017/") {
                        alert("Please Connect to another database");
                      } else {
                        setWorkingUri(uris);
                      }
                    } else if (workinguri != "mongodb://localhost:27017/") {
                      setWorkingUri(uris);
                    }
                  }}
                >
                  another database
                </h1>
                <ul className="gap-2 flex flex-col overflow-y-scroll">
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

            <div className="flex flex-col px-2 items-center space-y-4 p-1 border-2 bg-black z-10 border-[#292929]">
              <h2 className="text-xl text-center text-white">
                Connect to MongoDB
              </h2>
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
                    setUris(res);
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
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-6xl font-bold self-center">
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
              className={`p-4 border-t   ${
                isDarkMode ? "border-[#292929] " : "border-gray-300 bg-white"
              }`}
            >
              <div className="w-full  flex items-center space-x-3 ">
                <div className="card w-full hover:p-1 flex flex-col gap-2">
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
                  <div className="flex flex-row w-full">
                    <input
                      className={` card2 h-3 w-full flex-1  px-4 py-10  focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? "bg-[#292929] text-white focus:ring-[#787d81]"
                          : "bg-gray-100 text-black focus:ring-blue-400"
                      }`}
                      type="text"
                      name="dbName"
                      value={creds.dbName}
                      onChange={handleChange}
                      placeholder="Database Name"
                    />
                    <input
                      className={` card2 h-3 w-full flex-1  px-4 py-10  focus:outline-none focus:ring-2 ${
                        isDarkMode
                          ? "bg-[#292929] text-white focus:ring-[#787d81]"
                          : "bg-gray-100 text-black focus:ring-blue-400"
                      }`}
                      type="text"
                      name="colName"
                      value={creds.colName}
                      onChange={handleChange}
                      placeholder="Collection Name"
                    />
                  </div>
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
      </div>
    </>
  );
};

export default ChatGPTInterface;
