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

		app.patch('/api/products/:id', async (req, res) => {
			try {
				const { id } = req.params;

				if (!ObjectId.isValid(id)) {
					return res.status(400).json({
						error: 'Invalid product ID',
					});
				}

				const { name, description, price, category, stock } = req.body;

				const updates = {};

				if (name !== undefined) {
					if (typeof name !== 'string' || name.trim() === '') {
						return res.status(400).json({
							error: 'Name must be a non-empty string',
						});
					}

					updates.name = name.trim();
				}

				if (description !== undefined) {
					if (typeof description !== 'string') {
						return res.status(400).json({
							error: 'Description must be a string',
						});
					}

					updates.description = description.trim();
				}

				if (price !== undefined) {
					if (
						typeof price !== 'number' ||
						!Number.isFinite(price) ||
						price < 0
					) {
						return res.status(400).json({
							error: 'Price must be a non-negative number',
						});
					}

					updates.price = price;
				}

				if (category !== undefined) {
					if (
						typeof category !== 'string' ||
						category.trim() === ''
					) {
						return res.status(400).json({
							error: 'Category must be a non-empty string',
						});
					}

					updates.category = category.trim();
				}

				if (stock !== undefined) {
					if (!Number.isInteger(stock) || stock < 0) {
						return res.status(400).json({
							error: 'Stock must be a non-negative integer',
						});
					}

					updates.stock = stock;
				}

				if (Object.keys(updates).length === 0) {
					return res.status(400).json({
						error: 'Provide at least one valid field to update',
					});
				}

				const products = db.collection('products');

				const result = await products.updateOne(
					{ _id: new ObjectId(id) },
					{ $set: updates },
				);

				if (result.matchedCount === 0) {
					return res.status(404).json({
						error: 'Product not found',
					});
				}

				const updatedProduct = await products.findOne({
					_id: new ObjectId(id),
				});

				res.json({
					message: 'Product updated successfully',
					product: updatedProduct,
				});
			} catch (error) {
				console.error('Failed to update product:', error.message);
				res.status(500).json({
					error: 'Failed to update product',
				});
			}
		});

		app.delete('/api/products/:id', async (req, res) => {
			try {
				const { id } = req.params;

				if (!ObjectId.isValid(id)) {
					return res.status(400).json({
						error: 'Invalid product ID',
					});
				}

				const products = db.collection('products');

				const result = await products.deleteOne({
					_id: new ObjectId(id),
				});

				if (result.deletedCount === 0) {
					return res.status(404).json({
						error: 'Product not found',
					});
				}

				res.json({
					message: 'Product deleted successfully',
				});
			} catch (error) {
				console.error('Failed to delete product:', error.message);
				res.status(500).json({
					error: 'Failed to delete product',
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
