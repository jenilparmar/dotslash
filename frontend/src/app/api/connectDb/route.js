import { MongoClient } from "mongodb";

export async function POST(req) {
  try {
    // Parse the JSON body from the request
    const body = await req.json();
    const { connectionString } = body;

    console.log("Received Connection String:", connectionString);

    // Check if connection string is provided
    if (!connectionString) {
      return new Response(
        JSON.stringify({ error: "Connection string is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to MongoDB
    const client = new MongoClient(connectionString); // No need for deprecated options
    try {
      await client.connect();
    } catch (err) {
      console.error("Failed to connect to MongoDB:", err.message);
      return new Response(
        JSON.stringify({ error: "Failed to connect to MongoDB" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Fetch databases from the admin database
    const adminDb = client.db("admin");
    let databases;
    try {
      databases = await adminDb.admin().listDatabases();
      console.log("====>", databases);
    } catch (err) {
      console.error("Failed to list databases:", err.message);
      await client.close();
      return new Response(
        JSON.stringify({ error: "Failed to list databases" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    // Close the connection
    await client.close();

    // Respond with the list of databases
    return new Response(
      JSON.stringify({
        message: "Connection successful",
        databases: databases.databases,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in API:", error.message);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
