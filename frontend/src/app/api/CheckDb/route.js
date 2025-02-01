import { MongoClient } from "mongodb";
import { NextResponse } from "next/server";
// MongoDB connection check logic
async function checkDb(MongoDbUri) {
  const client = new MongoClient(MongoDbUri);
  try {
    // Connect the client to the server
    await client.connect();

    // List all databases
    const adminDb = client.db().admin();
    const dbs = await adminDb.listDatabases();
    console.log(dbs);
    
    // Return the list of databases
    return dbs;
  } catch (err) {
    console.error("Error occurred:", err);
    return false;
  } finally {
    // Ensures that the client will close when finished/error
    await client.close();
  }
}

// POST route handler
export async function POST(request) {
  try {
    const { MongoDbUri } = await request.json();

    // Call the checkDb function with the provided URI
    const result = await checkDb(MongoDbUri);

    if (result) {
      return new Response(JSON.stringify({ success: true, databases: result }), {
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ success: false, message: "Error connecting to MongoDB" }), {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Error in POST handler:", error);
    return new Response(JSON.stringify({ success: false, message: "Request failed" }), {
      status: 500,
    });
  }
}
