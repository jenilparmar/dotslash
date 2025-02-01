// app/api/revertInsert/route.js
import { MongoClient } from 'mongodb';

async function Revert_Insert(nameOfDb, nameOfCollection, data, MongodbURI) {
    const client = new MongoClient(MongodbURI);
    try {
        await client.connect();
        const db = client.db(nameOfDb);
        const collection = db.collection(nameOfCollection);
        await collection.insertMany(data);


        return new Response(JSON.stringify({ message: 'Data reverted successfully' }))
    }catch(error){
        return new Response(JSON.stringify({ message: 'Failed to revert data', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    } finally {
        await client.close();
    }
}

export async function POST(request) {
    try {
        const { nameOfDb, nameOfCollection, data, MongodbURI } = await request.json();

        // Validate the input
        if (!nameOfDb || !nameOfCollection || !data || !MongodbURI) {
            return new Response(JSON.stringify({ message: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Call the Revert_Insert function
        await Revert_Insert(nameOfDb, nameOfCollection, data, MongodbURI);

        return new Response(JSON.stringify({ message: 'Data reverted successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        return new Response(JSON.stringify({ message: 'Failed to revert data', error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
}