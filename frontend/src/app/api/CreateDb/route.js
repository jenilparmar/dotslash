// In /app/api/createdb/route.js
import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
async function handler(req) {
  if (req.method === 'POST') {
    try {
      const { nameOfDB, nameOfCollection, dataInArray, MongoDbUri } = await req.json();
      
      // Validate the inputs
      if (!nameOfDB || !nameOfCollection || !dataInArray || !MongoDbUri) {
        return NextResponse.json(
          { success: false, message: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Call the function to insert data
      const result = await createDb(nameOfDB, nameOfCollection, dataInArray, MongoDbUri);

      return NextResponse.json({ success: true, message: 'Data inserted successfully' });
    } catch (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }
  } else {
    return NextResponse.json({ success: false, message: `Method ${req.method} Not Allowed` }, { status: 405 });
  }
}

export async function createDb(nameOfDB, nameOfCollection, dataInArray , MongodbUri) {
  let uri = MongodbUri
  const client = new MongoClient(uri);
  try {
    // Connect to the database
    await client.connect();

    // Get database and collection references
    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    // Insert the provided data
    await collection.insertMany(dataInArray);
    console.log("Data Inserted Successfully!");

    return true;
  } catch (err) {
    console.error("Error inserting data:", err);
    return false;
  } finally {
    // Ensure the client is closed after the operation
    await client.close();
  }
}

export { handler as POST };
