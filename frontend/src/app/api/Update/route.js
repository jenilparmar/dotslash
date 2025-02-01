import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";
// readConditionData function
async function readConditionData(nameOfDB, nameOfCollection, atrs, MongoDbUri) {
  let uri = MongoDbUri;
  const client = new MongoClient(uri);

  try {
    // Connect to the database
    await client.connect();

    // Get database and collection references
    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    // Fetch all documents
    const res = await collection.find({}).toArray();

    // Use a Set to ensure uniqueness
    const uniqueResults = new Set();

    // Apply filters dynamically
    const response = res.filter((doc) => {
      const matches = atrs.every(({ field, operator, value }) => {
        if (Array.isArray(value)) {
          // Handle array of values (like `$in` in MongoDB)
          if (operator === "==") {
            return value.includes(doc[field]);
          } else if (operator === "!=") {
            return !value.includes(doc[field]);
          } else {
            throw new Error(`Unsupported operator for array: ${operator}`);
          }
        } else {
          // Handle regular single-value conditions
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

      // If the document matches, add it to the Set
      if (matches) {
        uniqueResults.add(JSON.stringify(doc)); // Serialize document to avoid object reference issues
      }

      return matches;
    });

    // Convert the Set back to an array and return unique results
    return Array.from(uniqueResults).map((doc) => JSON.parse(doc));
  } catch (err) {
    console.error("Error filtering data:", err);
    return [];
  } finally {
    // Ensure the client is closed after the operation
    await client.close();
  }
}

// updateData function
export async function updateData(nameOfDB, nameOfCollection, atrs, changeAtrs, MongoDbUri) {
  const client = new MongoClient(MongoDbUri);

  try {
    // Connect to MongoDB
    await client.connect();
    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    // Get data to update based on conditions
    const dataToUpdate = await readConditionData(nameOfDB, nameOfCollection, atrs, MongoDbUri);
    const response = [];

    // Iterate over the data to update
    for (const data of dataToUpdate) {
      const filter = { _id: new ObjectId(data._id) }; // Convert string _id to ObjectId

      // Update the specific field in the database
      const update = { $set: { [changeAtrs.field]: changeAtrs.value } };

      // Perform the update operation
      const result = await collection.updateOne(filter, update);
      response.push(result);
    }

    // Return the number of affected documents
    return `${response.length} data affected!`;
  } catch (error) {
    console.error("Error updating data:", error);
    return { success: false, message: "Error updating data" };
  } finally {
    await client.close();
  }
}

// API route handler for the POST request
export async function POST(req) {
  try {
    // Parse request body
    const { nameOfDB, nameOfCollection, atrs, changeAtrs, MongoDbUri } = await req.json();

    // Validate the required fields
    if (!nameOfDB || !nameOfCollection || !atrs || !changeAtrs || !MongoDbUri) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Call the updateData function
    const result = await updateData(nameOfDB, nameOfCollection, atrs, changeAtrs, MongoDbUri);

    // Return success response
    return new Response(
      JSON.stringify({ success: true, message: result }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
