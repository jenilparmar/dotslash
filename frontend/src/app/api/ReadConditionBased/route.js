// Import the required MongoDB client and NextResponse
import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";

// Define the POST method handler
export async function POST(req) {
  try {
    // Extract data from the request body
    const { nameOfDB, nameOfCollection, atrs, MongoDbUri } = await req.json();
    console.log({ nameOfDB, nameOfCollection, atrs, MongoDbUri });

    // Validate the inputs (optional but recommended)
    if (!nameOfDB || !nameOfCollection || !MongoDbUri) {
      return NextResponse.json({ success: false, message: "Missing required fields" }, { status: 400 });
    }

    console.log("1");

    // Call the readConditionData function
    const data = await readConditionData(nameOfDB, nameOfCollection, atrs, MongoDbUri);
    console.log(data);

    // Respond with the data object
    return NextResponse.json({ success: true,data: data }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the database call
    console.error(error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// The readConditionData function (your original code, no changes made here)
export async function readConditionData(nameOfDB, nameOfCollection, atrs , MongoDbUri) {
  let uri = MongoDbUri;
  const client = new MongoClient(uri);
  try {
    await client.connect();

    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    const res = await collection.find({}).toArray();
    const uniqueResults = new Set();

    const response = res.filter((doc) => {
      const matches = atrs.every(({ field, operator, value }) => {
        if (Array.isArray(value)) {
          if (operator === "==") {
            return value.includes(doc[field]);
          } else if (operator === "!=") {
            return !value.includes(doc[field]);
          } else {
            throw new Error(`Unsupported operator for array: ${operator}`);
          }
        } else {
          switch (operator) {
            case "<":
              return doc[field] < value;
            case "<=":
              return doc[field] <= value;
            case ">":
              return doc[field] > value;
            case ">=":
              return doc[field] >= value;
            case "==":
              return doc[field] == value;
            case "!=":
              return doc[field] != value;
            default:
              throw new Error(`Unsupported operator: ${operator}`);
          }
        }
      });

      if (matches) {
        uniqueResults.add(JSON.stringify(doc)); // Serialize document to avoid object reference issues
      }

      return matches;
    });

    return Array.from(uniqueResults).map((doc) => JSON.parse(doc));
  } catch (err) {
    console.error("Error filtering data:", err);
    return [];
  } finally {
    // Ensure the client is closed after the operation
    await client.close();
  }
}
