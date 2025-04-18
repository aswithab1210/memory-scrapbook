const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;

exports.handler = async function(event) {
    const client = new MongoClient(uri);
    const db = client.db('todo_app');
    const collection = db.collection('todos');

    try {
        await client.connect();
        const { httpMethod, body, queryStringParameters } = event;

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
            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: { completed } }
            );
            return { statusCode: 200, body: 'Updated' };
        }

        if (httpMethod === 'DELETE') {
            const { id } = queryStringParameters;
            await collection.deleteOne({ _id: new ObjectId(id) });
            return { statusCode: 200, body: 'Deleted' };
        }

        return { statusCode: 405, body: 'Method Not Allowed' };
    } catch (err) {
        return { statusCode: 500, body: err.toString() };
    } finally {
        await client.close();
    }
};
