require('dotenv').config();

const express = require('express');
const { MongoClient, ObjectId } = require('mongodb');

const app = express();
app.use(express.json());
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

		app.post('/api/products', async (req, res) => {
			try {
				const { name, description, price, category, stock } = req.body;

				if (
					typeof name !== 'string' ||
					name.trim() === '' ||
					typeof category !== 'string' ||
					category.trim() === '' ||
					typeof price !== 'number' ||
					!Number.isFinite(price) ||
					price < 0 ||
					!Number.isInteger(stock) ||
					stock < 0 ||
					(description !== undefined &&
						typeof description !== 'string')
				) {
					return res.status(400).json({
						error: 'Invalid product data',
					});
				}

				const newProduct = {
					name: name.trim(),
					description: description?.trim() ?? '',
					price,
					category: category.trim(),
					stock,
				};

				const products = db.collection('products');
				const result = await products.insertOne(newProduct);

				res.status(201).json({
					message: 'Product created successfully',
					product: {
						_id: result.insertedId,
						...newProduct,
					},
				});
			} catch (error) {
				console.error('Failed to create product:', error.message);
				res.status(500).json({ error: 'Failed to create product' });
			}
		});

		app.get('/api/products', async (req, res) => {
			try {
				const products = db.collection('products');

				const results = await products.find({}).toArray();

				res.json(results);
			} catch (error) {
				console.error('Failed to retrieve products:', error.message);
				res.status(500).json({ error: 'Failed to retrieve products' });
			}
		});

		app.get('/api/products/:id', async (req, res) => {
			try {
				const { id } = req.params;

				if (!ObjectId.isValid(id)) {
					return res.status(400).json({
						error: 'Invalid product ID',
					});
				}

				const products = db.collection('products');

				const product = await products.findOne({
					_id: new ObjectId(id),
				});

				if (!product) {
					return res.status(404).json({
						error: 'Product not found',
					});
				}

				res.json(product);
			} catch (error) {
				console.error('Failed to retrieve product:', error.message);
				res.status(500).json({ error: 'Failed to retrieve product' });
			}
		});

		app.get('/api/setup-product', async (req, res) => {
			try {
				const products = db.collection('products');

				const result = await products.insertOne({
					name: 'Wireless Headphones',
					description: 'Bluetooth headphones',
					price: 450,
					category: 'Electronics',
					stock: 12,
				});

				res.status(201).json({
					message: 'Sample product created',
					productId: result.insertedId,
				});
			} catch (error) {
				console.error(
					'Failed to create sample product:',
					error.message,
				);
				res.status(500).json({
					error: 'Failed to create sample product',
				});
			}
		});

		app.get('/api/test-data', async (req, res) => {
			try {
				const sampleDb = client.db('sample_mflix');
				const movies = sampleDb.collection('movies');

				const results = await movies.find({}).limit(5).toArray();

				res.json(results);
			} catch (error) {
				console.error('Failed to retrieve sample data:', error.message);
				res.status(500).json({
					error: 'Failed to retrieve sample data',
				});
			}
		});

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
