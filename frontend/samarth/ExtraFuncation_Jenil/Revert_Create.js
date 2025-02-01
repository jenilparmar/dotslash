import { MongoClient } from "mongodb";

async function Revert_Update(nameOfDb   , MongodbURI) {       ////When Insertion Happened
    const client = new MongoClient(MongodbURI);
    try {
        await client.connect();
        const db = client.db(nameOfDb);
        db.dropDatabase()
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
        const { nameOfDb , MongodbURI } = await request.json();

        // Validate the input
        if (!nameOfDb || !MongodbURI) {
            return new Response(JSON.stringify({ message: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        // Call the Revert_Insert function
        await Revert_Update(nameOfDb , MongodbURI);

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