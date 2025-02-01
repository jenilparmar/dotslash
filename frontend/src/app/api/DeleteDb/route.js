const { MongoClient } = require("mongodb");

async function DeleteDb(nameOfDB , MongodbUri) {
  let uri = MongodbUri;
  const client = new MongoClient(uri);
 
  if (!nameOfDB) {
    console.log("Error: Database name cannot be empty.");
    return false;
  }

  try {
    console.log(`Connecting to MongoDB to delete database: ${nameOfDB}...`);
    await client.connect();

    const connect = client.db(nameOfDB);

    await connect.dropDatabase();
    console.log(`Database "${nameOfDB}" deleted successfully.`);
    return true;

  } catch (err) {
    console.error("Error while deleting the database:");
    console.error(`Message: ${err.message}`);
    console.error(`Stack: ${err.stack}`);
    return false;

  } finally {
    console.log("Closing MongoDB connection...");
    await client.close();
  }
}

