import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';
export async function readAllData(nameOfDB, nameOfCollection, MongodbUri) {
  const uri = MongodbUri;
  const client = new MongoClient(uri);
  try {
    // Connect to the database
    await client.connect();

    // Get database and collection references
    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    // Fetch all data from the collection
    const res = await collection.find({}).toArray();
    console.log("Data fetched successfully!");

    return res;
  } catch (err) {
    console.error("Error fetching data:", err);
    return [{}];  // Return an empty object if there's an error
  } finally {
    // Ensure the client is closed after the operation
    await client.close();
  }
}

export async function POST(req) {
  try {
    // Extract data from the request body
    const { nameOfDB, nameOfCollection, MongoDbUri } = await req.json();

    // Validate the required parameters
    if (!nameOfDB || !nameOfCollection || !MongoDbUri) {
      return new NextResponse(
        JSON.stringify({
          success: false,
          message: 'Missing required fields (nameOfDB, nameOfCollection, MongoDbUri)',
        }),
        { status: 400 }
      );
    }

    // Call the function to fetch all data
    const data = await readAllData(nameOfDB, nameOfCollection, MongoDbUri);

    // Respond with the data
    return new NextResponse(
      JSON.stringify({ success: true, data:data }),
      { status: 200 }
    );
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
