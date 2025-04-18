const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI; // Ensure this is set correctly in Netlify environment variables
const client = new MongoClient(uri);
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    try {
        console.log("Connecting to MongoDB..."); // Add a log for connection attempt
        await client.connect();
        cachedDb = client.db('todo_app');  // The database name
        console.log("Connected to MongoDB");  // Success log
        return cachedDb;
    } catch (err) {
        console.error('Error connecting to MongoDB:', err); // Improved error logging
        throw err;
    }
}

exports.handler = async function(event) {
    const { httpMethod, body, queryStringParameters } = event;
    const db = await connectToDatabase();
    const collection = db.collection('todos');
    
    console.log('Received HTTP method:', httpMethod);  // Log the HTTP method

    try {
        if (httpMethod === 'GET') {
            const todos = await collection.find({}).toArray();
            console.log('Fetched todos:', todos); // Log the todos fetched
            return {
                statusCode: 200,
                body: JSON.stringify(todos),
            };
        }

        if (httpMethod === 'POST') {
            const { text } = JSON.parse(body);
            console.log('Inserting new todo:', text);  // Log the text being inserted
            const result = await collection.insertOne({ text, completed: false });
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }

        if (httpMethod === 'PUT') {
            const { id, completed } = JSON.parse(body);
            console.log('Updating todo with ID:', id, 'Completed:', completed); // Log update details
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
            console.log('Deleting todo with ID:', id); // Log delete action
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
