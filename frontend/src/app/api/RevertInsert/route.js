import { ExtractDataFromPara } from "@/app/api/InsertData/ExtractDataFromInsert";
import { MongoClient } from "mongodb";

async function Revert_Delete(nameOfDb, nameOfCollection, data, MongodbURI) {
  const client = new MongoClient(MongodbURI);
  try {
    await client.connect();
    const db = client.db(nameOfDb);
    const collection = db.collection(nameOfCollection);

    console.log("Data to Delete:", JSON.stringify(data, null, 2));

    // Ensure data is an array before applying `$or`
    const filter =
      Array.isArray(data) && data.length > 0 ? { $or: data } : data;

    const deleteResult = await collection.deleteMany(filter);
    console.log("Deleted Count:", deleteResult.deletedCount);

    return new Response(
      JSON.stringify({
        message: `${deleteResult.deletedCount} entries reverted successfully`,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in deletion:", error);
    return new Response(
      JSON.stringify({
        message: "Failed to revert data",
        error: error.message,
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  } finally {
    await client.close();
  }
}

export async function POST(request) {
  try {
    const { nameOfDb, nameOfCollection, paragraph, MongodbURI } =
      await request.json();

    // Validate the input
    if (!nameOfDb || !nameOfCollection || !paragraph || !MongodbURI) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const data = ExtractDataFromPara(paragraph);
    console.log(data);
    // Call the Revert_Insert function
    await Revert_Delete(nameOfDb, nameOfCollection, data, MongodbURI);

    return new Response(
      JSON.stringify({ message: "Data reverted successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        message: "Failed to revert data",
        error: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
