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

    const { data, hash } = await req.json(); // Correct way to parse request body in Next.js App Router
    console.log({ data, hash });

    if (!data || !hash) {
      return new Response(
        JSON.stringify({ message: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const result = await collection.insertOne({ data, hash });

    return new Response(
      JSON.stringify({
        message: "Data inserted successfully",
        insertedId: result.insertedId,
      }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error inserting data:", error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
