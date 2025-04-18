const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI; // Ensure this is set correctly in Netlify environment variables
const client = new MongoClient(uri);
let cachedDb = null;

async function connectToDatabase() {
    if (cachedDb) return cachedDb;
    try {
        console.log("Connecting to MongoDB...");
        await client.connect();
        cachedDb = client.db('memory_scrapbook');  // Database name
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
    const collection = db.collection('memories');  // Collection name

    console.log('Received HTTP method:', httpMethod);

    try {
        if (httpMethod === 'GET') {
            const memories = await collection.find({}).toArray();
            return {
                statusCode: 200,
                body: JSON.stringify(memories),
            };
        }

        if (httpMethod === 'POST') {
            const { title, description, category, image } = JSON.parse(body);

            // Basic validation
            if (!title || !category) {
                return { statusCode: 400, body: 'Title and Category are required.' };
            }

            const result = await collection.insertOne({
                title,
                description: description || '',
                category,
                image: image || '',
                createdAt: new Date(),
                updatedAt: new Date(),
            });

            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }

        if (httpMethod === 'PUT') {
            const { id, title, description, category, image } = JSON.parse(body);

            if (!ObjectId.isValid(id)) {
                return { statusCode: 400, body: 'Invalid ID format' };
            }

            const updateData = { updatedAt: new Date() };
            if (title !== undefined) updateData.title = title;
            if (description !== undefined) updateData.description = description;
            if (category !== undefined) updateData.category = category;
            if (image !== undefined) updateData.image = image;

            await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
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

    }
};
