const { MongoClient } = require('mongodb');
const AWS = require('aws-sdk');
const s3 = new AWS.S3();
const BUCKET_NAME = process.env.S3_BUCKET_NAME;  // Set your S3 bucket name in environment variables
const mongoURI = process.env.MONGO_URI;  // Set your MongoDB URI in environment variables
let collection;

async function connectToDatabase() {
    if (collection) return collection;
    
    const client = new MongoClient(mongoURI);
    await client.connect();
    const db = client.db('memory-scrapbook');  // Use your DB name here
    collection = db.collection('todos');
    return collection;
}

async function uploadImageToS3(imageBuffer) {
    const params = {
        Bucket: BUCKET_NAME,
        Key: `todos/${Date.now()}.jpg`,
        Body: imageBuffer,
        ContentType: 'image/jpeg',
        ACL: 'public-read',  // Make the image publicly accessible
    };
    const { Location } = await s3.upload(params).promise();
    return Location;  // Return the URL of the uploaded image
}

exports.handler = async (event) => {
    const { httpMethod, body, queryStringParameters } = event;
    const collection = await connectToDatabase();

    // Handle pagination (page & limit query params)
    const page = parseInt(queryStringParameters?.page || 1);
    const limit = parseInt(queryStringParameters?.limit || 20);
    const skip = (page - 1) * limit;

    // Handle GET request to fetch todos
    if (httpMethod === 'GET') {
        try {
            const todos = await collection
                .find({}, { projection: { text: 1, completed: 1, image: 1 } })  // Exclude large fields if necessary
                .skip(skip)
                .limit(limit)
                .toArray();
            
            return {
                statusCode: 200,
                body: JSON.stringify(todos),
            };
        } catch (error) {
            console.error('Error fetching todos:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to fetch todos' }),
            };
        }
    }

    // Handle POST request to add a new todo
    if (httpMethod === 'POST') {
        try {
            const { text, image } = JSON.parse(body);
            let imageUrl = null;
            if (image) {
                // Upload the image to S3 and get the URL
                imageUrl = await uploadImageToS3(Buffer.from(image, 'base64'));
            }
            const result = await collection.insertOne({
                text,
                image: imageUrl,  // Store the URL, not the image data
                completed: false,
            });
            
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (error) {
            console.error('Error adding todo:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to add todo' }),
            };
        }
    }

    // Handle PUT request to update a todo
    if (httpMethod === 'PUT') {
        try {
            const { id, text, completed, image } = JSON.parse(body);
            let imageUrl = null;
            if (image) {
                // Upload the image to S3 and get the URL
                imageUrl = await uploadImageToS3(Buffer.from(image, 'base64'));
            }
            const updateData = {
                text,
                completed,
                image: imageUrl,  // Update with image URL
            };
            const result = await collection.updateOne(
                { _id: new MongoClient.ObjectId(id) },
                { $set: updateData }
            );
            
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (error) {
            console.error('Error updating todo:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to update todo' }),
            };
        }
    }

    // Handle DELETE request to remove a todo
    if (httpMethod === 'DELETE') {
        try {
            const { id } = JSON.parse(body);
            const result = await collection.deleteOne({ _id: new MongoClient.ObjectId(id) });
            return {
                statusCode: 200,
                body: JSON.stringify(result),
            };
        } catch (error) {
            console.error('Error deleting todo:', error);
            return {
                statusCode: 500,
                body: JSON.stringify({ error: 'Failed to delete todo' }),
            };
        }
    }

    return {
        statusCode: 405,
        body: JSON.stringify({ error: 'Method Not Allowed' }),
    };
};
