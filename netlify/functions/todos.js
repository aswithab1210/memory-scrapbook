const { MongoClient, ObjectId } = require('mongodb');
const cloudinary = require('cloudinary').v2;

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const mongoURI = process.env.MONGO_URI;
let collection;

// Connect to MongoDB
async function connectToDatabase() {
    if (collection) return collection;
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('memory-scrapbook');  // Use your DB name here
    collection = db.collection('todos');
    return collection;
}

// Upload image to Cloudinary
async function uploadImageToCloudinary(base64) {
    const result = await cloudinary.uploader.upload(base64, {
        folder: 'todos',
    });
    return result.secure_url;  // Return the Cloudinary image URL
}

// Main Lambda Handler
exports.handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    const collection = await connectToDatabase();

    const page = parseInt(queryStringParameters?.page || 1);
    const limit = parseInt(queryStringParameters?.limit || 20);
    const skip = (page - 1) * limit;

    try {
        // GET: Fetch Todos
        if (httpMethod === 'GET') {
            const todos = await collection
                .find({}, { projection: { text: 1, completed: 1, image: 1 } })
                .skip(skip)
                .limit(limit)
                .toArray();

            return {
                statusCode: 200,
                body: JSON.stringify(todos),
            };
        }

        // POST: Add New Todo
        if (httpMethod === 'POST') {
            const { text, image } = JSON.parse(body);
            let imageUrl = null;

            if (image) {
                imageUrl = await uploadImageToCloudinary(image);
            }

            const result = await collection.insertOne({
                text,
                image: imageUrl,
                completed: false,
            });

            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }

        // PUT: Update Todo
        if (httpMethod === 'PUT') {
            const { id, text, completed, image } = JSON.parse(body);
            let imageUrl = null;

            if (image?.startsWith('data:')) {  // Check if it's a new base64 image
                imageUrl = await uploadImageToCloudinary(image);
            }

            const updateData = { text, completed };
            if (imageUrl) updateData.image = imageUrl;

            const result = await collection.updateOne(
                { _id: new ObjectId(id) },
                { $set: updateData }
            );

            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }

        // DELETE: Remove Todo
        if (httpMethod === 'DELETE') {
            const { id } = JSON.parse(body);
            const result = await collection.deleteOne({ _id: new ObjectId(id) });

            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        }

        // Invalid Method
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' }),
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message }),
        };
    }
};
