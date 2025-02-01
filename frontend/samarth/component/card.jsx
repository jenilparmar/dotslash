import { hash } from "crypto";

import { useState } from "react";

export default function Card({ statement, query, intent, transaction, date }) {
  let [input, setInput] = useState({ dbName: "", collectionName: "" });
  let [names, setNames] = useState(false);
  console.log(intent);
  return (
    <div className="max-w-sm mx-auto my-4 p-6 bg-gradient-to-br from-white to-gray-50 border border-gray-100 rounded-2xl shadow-2xl hover:shadow-3xl transition-shadow duration-300 transform hover:-translate-y-1">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3">Statement</h2>
        <p className="text-md text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
          {statement}
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">Query</h3>
        <p className="text-md text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
          {query}
        </p>
      </div>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-3">
          transaction id{" "}
        </h3>
        <p className="text-md text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100">
          {transaction}
        </p>
      </div>
      {names ? (
        <div className="mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Add </h3>
          <input
            type="text"
            className="text-md text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100"
            placeholder="database name"
            onChange={(e) => setInput({ ...input, dbName: e.target.value })}
          />
          <input
            type="text"
            className="text-md text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg border border-gray-100"
            placeholder="collection name"
            onChange={(e) =>
              setInput({ ...input, collectionName: e.target.value })
            }
          />
        </div>
      ) : (
        <></>
      )}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 italic">
          {new Date(date).toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </p>
        <button onClick={()=>{
          setNames(true);

        }} className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">Add Info</button>
        {["update", "delete", "insert"].includes(intent) ? (
          <button
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            onClick={async () => {
              if (intent === "insert") {
                try {
                  let res = await fetch("/api/RevertInsert", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json", // ✅ Fix: Specify content type
                    },
                    body: JSON.stringify({
                      nameOfDb: input.dbName,
                      nameOfCollection: input.collectionName,
                      paragraph: query,
                      MongodbURI: "mongodb://localhost:27017",
                    }),
                  });

                  if (!res.ok) {
                    throw new Error(`HTTP error! Status: ${res.status}`); // ✅ Fix: Handle HTTP errors
                  }

                  let reso = await res.json();
                  console.log(reso?.message || "No message returned"); // ✅ Fix: Avoid potential undefined errors

                  if (reso?.statusCode === 200) {
                    alert("Data Reverted Successfully!!");
                  } else {
                    console.warn("Revert failed:", reso);
                  }
                } catch (error) {
                  console.error("Error in RevertInsert:", error); // ✅ Fix: Proper error handling
                  alert("Failed to revert data.");
                }
              }

              if (intent === "delete") {
                let res = await fetch("/api/getdeleteddata", {
                  method: "POST",
                  body: JSON.stringify({
                    hash: transaction,
                  }),
                });
                let reso = await res.json();
                console.log(reso.data.data);
                console.log(input.dbName, input.collectionName, reso.data.data);

                let re = await fetch("/api/InsertData", {
                  method: "POST",
                  body: JSON.stringify({
                    nameOfDB: input.dbName,
                    nameOfColletion: input.collectionName,
                    data: reso.data.data,
                    MongodbUri: "mongodb://localhost:27017",
                  }),
                });
                console.log(re);
                if(re?.statusCode ==200 ){
                  alert("Deleted Data Reverted back to your Localhost!!!")
                }
              }
            }}>
            Revert
          </button>
        ) : (
          <></>
        )}
      </div>
    </div>
  );
}
