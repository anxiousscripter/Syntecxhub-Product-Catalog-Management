require('dotenv').config();

const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = 3000;

const client = new MongoClient(process.env.MONGODB_URI);

let db;

app.get('/', (req, res) => {
	res.send('Product Catalog API is running!');
});

async function startServer() {
	try {
		await client.connect();

		db = client.db(process.env.DB_NAME);

		console.log('Connected to MongoDB successfully!');

		app.listen(PORT, () => {
			console.log(`Server running on port ${PORT}`);
		});
	} catch (error) {
		console.error('Failed to start the server:', error.message);
		await client.close().catch(() => {});
		process.exit(1);
	}
}

startServer();
