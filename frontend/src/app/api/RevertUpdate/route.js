import { MongoClient, ObjectId } from "mongodb";

export async function POST(req) {
  try {
    const { dbName, collectionName, newData, MongoDbUri } = await req.json();
    if (!dbName || !collectionName || !newData || !MongoDbUri) {
      throw new Error("Missing required parameters");
    }

    const client = new MongoClient(MongoDbUri);
    await client.connect();
    const db = client.db(dbName);
    const collection = db.collection(collectionName);

    let updateResults = [];

    // Loop through each document in newData array
    for (const item of newData) {
      const { _id, ...updatedFields } = item;
      if (!_id) continue;

      const filter = { _id: new ObjectId(_id) };
      const update = { $set: updatedFields };

      // Update each document
      const result = await collection.updateOne(filter, update);
      updateResults.push(result);
    }

    await client.close();

    return new Response(
      JSON.stringify({
        success: true,
        message: `${updateResults.length} documents updated successfully`,
        results: updateResults,
      }),
      { status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
