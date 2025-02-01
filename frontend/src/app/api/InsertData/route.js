import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
// insertData function
export async function insertData(nameOfDB, nameOfColletion, data, MongodbUri) {
  let uri = MongodbUri;
  const client = new MongoClient(uri);

  if (!Array.isArray(data)) {
    console.error("Kindly Add Array in Data nothing other than that!!");
    return { success: false, message: "Data must be an array" };
  }

  if (!nameOfColletion || !nameOfDB) {
    console.error("Please Enter the Name of Database or Collection Correctly!!");
    return { success: false, message: "Missing Database or Collection name" };
  }

  try {
    await client.connect();
    const db = client.db(nameOfDB);
    const col = db.collection(nameOfColletion);

    // Insert data into the collection
    const res = await col.insertMany(data);
    console.log(`${res.insertedCount} documents were inserted`);

    return { success: true, insertedCount: res.insertedCount };
  } catch (err) {
    console.error("Error inserting data:", err);
    return { success: false, message: "Error inserting data" };
  } finally {
    await client.close();
  }
}

// POST API handler
export async function POST(req) {
  try {
    // Parse the request body
    const { nameOfDB, nameOfColletion, data, MongodbUri } = await req.json();

    // Validate required fields
    if (!nameOfDB || !nameOfColletion || !data || !MongodbUri) {
      return new NextResponse(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400 }
      );
    }

    // Call insertData function
    const result = await insertData(nameOfDB, nameOfColletion, data, MongodbUri);

    // Return the result of the insertion
    return new NextResponse(
      JSON.stringify(result),
      { status: result.success ? 200 : 500 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
