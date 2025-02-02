import { MongoClient, ObjectId } from "mongodb";

// Function to read data based on conditions
async function readConditionData(nameOfDB, nameOfCollection, atrs, MongoDbUri) {
  const client = new MongoClient(MongoDbUri);

  try {
    await client.connect();
    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    const res = await collection.find({}).toArray();

    // Apply filters dynamically
    const response = res.filter((doc) => {
      return atrs.every(({ field, operator, value }) => {
        if (Array.isArray(value)) {
          if (operator === "==") return value.includes(doc[field]);
          if (operator === "!=") return !value.includes(doc[field]);
        } else {
          switch (operator) {
            case "<":
              return doc[field] < value;
            case "<=":
              return doc[field] <= value;
            case ">":
              return doc[field] > value;
            case ">=":
              return doc[field] >= value;
            case "==":
              return doc[field] == value;
            case "!=":
              return doc[field] != value;
          }
        }
        return false;
      });
    });

    return response; // No need to use Set, MongoDB already returns unique documents
  } catch (err) {
    console.error("Error filtering data:", err);
    return [];
  } finally {
    await client.close();
  }
}

// Function to update document fields dynamically
export async function updateData(
  nameOfDB,
  nameOfCollection,
  atrs,
  changeAtrsArray,
  MongoDbUri,
  hash
) {
  const client = new MongoClient(MongoDbUri);

  try {
    await client.connect();
    const database = client.db(nameOfDB);
    const collection = database.collection(nameOfCollection);

    // Get documents that match conditions
    const dataToUpdate = await readConditionData(
      nameOfDB,
      nameOfCollection,
      atrs,
      MongoDbUri
    );
    console.log(nameOfDB, nameOfCollection);

    if (!dataToUpdate.length) return "No matching data found";

    const response = [];

    for (const data of dataToUpdate) {
      if (!data._id) continue;

      const filter = { _id: new ObjectId(data._id) };

      // Convert changeAtrsArray to a single object { key: value }
      const updateFields = changeAtrsArray.reduce((acc, obj) => {
        return { ...acc, ...obj };
      }, {});

      // Construct the update object
      const update = { $set: updateFields };

      // Perform the update
      const result = await collection.findOneAndUpdate(filter, update);
      console.log(result);
      let reso = [];
      reso.push(result);
      console.log("----------> rs", reso, "============", hash);
      await fetch("http://localhost:3000/api/inserDeleted", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: reso, hash: hash }),
      });

      response.push(reso);
    }

    return response.length;
  } catch (error) {
    console.error("Error updating data:", error);
    return { success: false, message: "Error updating data" };
  } finally {
    await client.close();
  }
}
// API route handler for POST request
export async function POST(req) {
  try {
    const { nameOfDB, nameOfCollection, atrs, changeAtrs, MongoDbUri, hash } =
      await req.json();

    if (!nameOfDB || !nameOfCollection || !atrs || !changeAtrs || !MongoDbUri) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required fields" }),
        { status: 400 }
      );
    }

    const result = await updateData(
      nameOfDB,
      nameOfCollection,
      atrs,
      changeAtrs,
      MongoDbUri,
      hash
    );

    return new Response(JSON.stringify({ success: true, message: result }), {
      status: 200,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { status: 500 }
    );
  }
}
