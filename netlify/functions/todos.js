const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
  // Make sure this is set in your Netlify environment variables
const client = new MongoClient(uri);
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    try {
        await client.connect();
        cachedDb = client.db('todo_app');  // The database name
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

    try {
        if (httpMethod === 'GET') {
            const todos = await collection.find({}).toArray();
            return {
                statusCode: 200,
                body: JSON.stringify(todos),
            };
        }

        if (httpMethod === 'POST') {
            const { text } = JSON.parse(body);
            const result = await collection.insertOne({ text, completed: false });
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }

        if (httpMethod === 'PUT') {
            const { id, completed } = JSON.parse(body);
            if (!ObjectId.isValid(id)) {
                return { statusCode: 400, body: 'Invalid ID format' };
            }
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { completed } }
            );
            return { statusCode: 200, body: 'Updated' };
        }

        if (httpMethod === 'DELETE') {
            const { id } = queryStringParameters;
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
    } finally {
        await client.close();
    }
};
