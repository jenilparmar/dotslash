const { MongoClient } = require("mongodb");

export async function DeleteCollection(nameOfDB, nameOfCollection, MongoDbUri) {
  const client = new MongoClient(MongoDbUri);

  if (!nameOfDB || !nameOfCollection) {
    console.log("Error: Database name or collection name cannot be empty.");
    return { success: false, message: "Database name or collection name cannot be empty." };
  }

  try {
    await client.connect();

    // Access the specified database
    const db = client.db(nameOfDB);

    // Check if the collection exists
    const collections = await db.listCollections({ name: nameOfCollection }).toArray();
    if (collections.length === 0) {
      console.log(`Error: Collection "${nameOfCollection}" does not exist in database "${nameOfDB}".`);
      return { success: false, message: `Collection "${nameOfCollection}" does not exist in database "${nameOfDB}".` };
    }

    // Drop the collection
    await db.dropCollection(nameOfCollection);
    console.log(`${nameOfCollection} deleted successfully.`);
    return { success: true, message: `${nameOfCollection} deleted successfully.` };
  } catch (err) {
    console.error("Error while deleting the collection:");
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    return { success: false, message: `Error while deleting the collection: ${err.message}` };
  } finally {
    console.log("Closing MongoDB connection...");
    await client.close();
  }
}

export async function POST(req) {
  try {
    const body = await req.json(); // Ensure this is awaited
    const { nameOfDB, nameOfCollection, MongoDbUri } = body;

    // Validate input
    if (!nameOfDB || !nameOfCollection || !MongoDbUri) {
      return new Response(
        JSON.stringify({
          success: false,
          message: "Database name, collection name, and MongoDB URI are required.",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call the function to delete the collection
    const result = await DeleteCollection(nameOfDB, nameOfCollection, MongoDbUri);

    return new Response(JSON.stringify(result), {
      status: result.success ? 200 : 500,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: "Server error.",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
