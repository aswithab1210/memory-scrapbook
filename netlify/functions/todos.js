const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;  // Make sure your environment variable is set in Netlify!
const client = new MongoClient(uri);
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        cachedDb = client.db('todo_app');  // your database name
        console.log("Connected to MongoDB");
        return cachedDb;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err);
        throw err;
    }
}

exports.handler = async function(event) {
    const { httpMethod, body, queryStringParameters } = event;
    const db = await connectToDatabase();
    const collection = db.collection('todos');

    console.log('Received HTTP method:', httpMethod);

    try {
        if (httpMethod === 'GET') {
            const todos = await collection.find({}).toArray();
            console.log('Fetched todos:', todos);
            return {
                statusCode: 200,
                body: JSON.stringify(todos),
            };
        }

        if (httpMethod === 'POST') {
            const { text, image } = JSON.parse(body);
            console.log('Inserting new todo:', { text, image });
            const result = await collection.insertOne({
                text,
                image: image || null,  // Save null if no image
                completed: false
            });
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }

        if (httpMethod === 'PUT') {
            const { id, text, image, completed } = JSON.parse(body);
            console.log('Updating todo:', { id, text, image, completed });

            if (!ObjectId.isValid(id)) {
                return { statusCode: 400, body: 'Invalid ID format' };
            }

            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { text, image, completed } }  // now includes image!
            );

            return { statusCode: 200, body: 'Updated' };
        }

        if (httpMethod === 'DELETE') {
            const { id } = queryStringParameters;
            console.log('Deleting todo with ID:', id);

            if (!ObjectId.isValid(id)) {
                return { statusCode: 400, body: 'Invalid ID format' };
            }

            await collection.deleteOne({ _id: new ObjectId(id) });
            return { statusCode: 200, body: 'Deleted' };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (err) {
        console.error('Error:', err);
        return { statusCode: 500, body: 'Internal Server Error: ' + err.message };
    }
};
