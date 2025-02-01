import { MongoClient } from "mongodb";
import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
// The existing readConditionData function
async function readConditionData(nameOfDB, nameOfCollection, atrs, MongodbUri) {
  const client = new MongoClient(MongodbUri);
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
        uniqueResults.add(JSON.stringify(doc));
      }

      return matches;
    });

    return Array.from(uniqueResults).map((doc) => JSON.parse(doc));
  } catch (err) {
    console.error("Error filtering data:", err);
    return [];
  } finally {
    await client.close();
  }
}

// Delete function
export async function DeleteConditionBased(
  nameOfDB,
  nameOfCollection,
  atrs,
  MongodbUri
) {
  const client = new MongoClient(MongodbUri);

  try {
    await client.connect();
    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    const dataToUpdate = await readConditionData(
      nameOfDB,
      nameOfCollection,
      atrs,
      MongodbUri
    );
    const response = [];

    for (const data of dataToUpdate) {
      const filter = { _id: new ObjectId(data._id) };
      const result = await collection.findOneAndDelete(filter);
      response.push(result);
    }
    console.log(response);
    console.log(`${response.length} data affected!`);
    return { success: true, deletedCount: response.length, data: response };
  } catch (error) {
    console.error("Error deleting data:", error);
    return { success: false, message: "Error deleting data" };
  } finally {
    await client.close();
  }
}

// POST handler
export async function POST(req) {
  try {
    // Extract data from the request body
    const { nameOfDB, nameOfCollection, atrs, MongoDbUri } = await req.json();

    // Validate required fields
    if (!nameOfDB || !nameOfCollection || !MongoDbUri || !atrs) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Call DeleteConditionBased
    const result = await DeleteConditionBased(
      nameOfDB,
      nameOfCollection,
      atrs,
      MongoDbUri
    );

    // Return the result of the deletion
    return new NextResponse(JSON.stringify(result), {
      status: result.success ? 200 : 500,
    });
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
