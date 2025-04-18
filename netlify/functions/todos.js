const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    await client.connect();
    cachedDb = client.db('todo_app');
    return cachedDb;
}

exports.handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    const db = await connectToDatabase();
    const collection = db.collection('todos');


    try {
        if (httpMethod === 'GET') {
            const page = parseInt(queryStringParameters?.page || '1');
            const limit = 50;
            const skip = (page - 1) * limit;
            const todos = await collection.find({}).skip(skip).limit(limit).toArray();
            return { statusCode: 200, body: JSON.stringify(todos) };
        }

        if (httpMethod === 'POST') {
            const { text, image } = JSON.parse(body);
            const result = await collection.insertOne({ text, image: image || null, completed: false });
            return { statusCode: 200, body: JSON.stringify(result.ops?.[0] || {}) };
        }

        if (httpMethod === 'PUT') {
            const { id, text, image, completed } = JSON.parse(body);
            if (!ObjectId.isValid(id)) return { statusCode: 400, body: 'Invalid ID' };

            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { ...(text && { text }), ...(image !== undefined && { image }), ...(completed !== undefined && { completed }) } }
            );
            
            return { statusCode: 200, body: 'Updated' };
        }

        if (httpMethod === 'DELETE') {
            const { id } = queryStringParameters;
            if (!ObjectId.isValid(id)) return { statusCode: 400, body: 'Invalid ID' };

            await collection.deleteOne({ _id: new ObjectId(id) });
            return { statusCode: 200, body: 'Deleted' };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };

    } catch (err) {
        return { statusCode: 500, body: `Server Error: ${err.message}` };
    }
};
