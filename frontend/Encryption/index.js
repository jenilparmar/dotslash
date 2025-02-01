const { MongoClient } = require('mongodb');
const CryptoJS = require('crypto-js');



function encryptDocument(document, key) {
    const jsonString = JSON.stringify(document);
    const encryptedData = CryptoJS.AES.encrypt(jsonString, key).toString();
    return encryptedData;
  }
  
  // Decrypt a document
  function decryptDocument(encryptedData, key) {
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
    const decryptedData = bytes.toString(CryptoJS.enc.Utf8);
    return JSON.parse(decryptedData);
  }



// MongoDB connection
const url = "mongodb://localhost:27017";
const client = new MongoClient(url);

async function insertEncryptedDocument() {
  try {
    await client.connect();
    const db = client.db("testdb");
    const collection = db.collection("testcollection");

    // Document to insert
    const document = {
      name: "Jane Doe",
      email: "jane.doe@example.com",
      age: 28
    };

    // Encrypt the document
    const encryptedDocument = encryptDocument(document, "b2d1c3e4f5g6h7j8k9l0m1n2o3p4q5r");

    // Insert the encrypted document
    await collection.insertOne({ data: encryptedDocument });
    console.log("Encrypted document inserted!");
  } finally {
    await client.close();
  }
}

// insertEncryptedDocument();




async function retrieveAndDecryptDocument() {
    try {
      await client.connect();
      const db = client.db("testdb");
      const collection = db.collection("testcollection");
  
      // Retrieve the encrypted document
      const encryptedEntry = await collection.find({}).toArray();

     const decryptedData = []
     encryptedEntry.forEach((e)=>{
       decryptedData.push(decryptDocument(e['data'] , "b2d1c3e4f5g6h7j8k9l0m1n2o3p4q5r"))

     })
     
   console.log(decryptedData);
   
    } finally {
      await client.close();
    }
  }
  
  retrieveAndDecryptDocument();
  