import { MongoClient } from "mongodb";

const client = new MongoClient(
  "mongodb+srv://jenilparmar:dsfkjnksdfaa@cluster0.utm2zr0.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

async function connectDB() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
}

export async function POST(req) {
  try {
    await connectDB();
    const db = client.db("userData");
    const collection = db.collection("deletedData");

    const { hash } = await req.json(); // Get 'hash' from request body
    console.log("Searching for hash:", hash);

    if (!hash) {
      return new Response(JSON.stringify({ message: "Hash is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Find document with matching hash
    const data = await collection.findOne({ hash });

    if (!data) {
      return new Response(JSON.stringify({ message: "No data found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ message: "Data found", data }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching data:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
