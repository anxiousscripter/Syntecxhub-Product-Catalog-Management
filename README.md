# Syntecxhub Product Catalog Management

A RESTful API built with Node.js, Express, and MongoDB for managing a product catalog. It supports creating, retrieving, updating, and deleting products, searching and filtering products, pagination, and category-level statistics using MongoDB aggregation.

## Features

- **Product management:** Create, retrieve, update, and delete products.
- **Search:** Search products by name using case-insensitive matching.
- **Filtering:** Filter products by category.
- **Pagination:** Retrieve products in manageable pages with configurable page sizes.
- **Aggregation:** Generate category statistics, including product counts, average prices, and total stock.
- **Input validation:** Validate product data, query parameters, and product IDs.
- **API key protection:** Require an API key for creating, updating, and deleting products.

## Technologies Used

- [Node.js](https://nodejs.org/) — JavaScript runtime.
- [Express](https://expressjs.com/) — Web framework for building the API.
- [MongoDB](https://www.mongodb.com/) — NoSQL database for storing products.
- [MongoDB Node.js Driver](https://www.mongodb.com/docs/drivers/node/current/) — Connects the application to MongoDB.
- [dotenv](https://www.npmjs.com/package/dotenv) — Loads environment variables from a `.env` file.
- [Postman](https://www.postman.com/) — Used to test API requests.

## Prerequisites

Before setting up the project, ensure you have:

- Node.js and npm installed.
- A MongoDB Atlas account and a database deployment.
- Postman installed, or another HTTP client for testing the API.

You can check your Node.js and npm installations by running:

```bash
node --version
npm --version
```

## Installation and Setup

### 1. Navigate to the project directory

Open a terminal in the project folder:

```bash
cd product-catalog-api
```

If you are working from a Git repository, clone it first and navigate into the cloned directory.

### 2. Install dependencies

Install the project dependencies with:

```bash
npm install
```

The main dependencies are Express, the MongoDB Node.js driver, and dotenv. If setting up the project from scratch, they can be installed with:

```bash
npm install express mongodb dotenv
```

### 3. Configure MongoDB Atlas

Create a MongoDB Atlas deployment if you do not already have one.

In Atlas:

1. Create a database user with appropriate permissions.
2. Configure network access to allow your development machine to connect.
3. Obtain your MongoDB connection string from the deployment's **Connect** section.
4. Create or use a database named `product_catalog`.

The API uses a `products` collection within this database. MongoDB will create the collection automatically when the first product is inserted if it does not already exist.

### 4. Configure environment variables

Create a file named `.env` in the root of the project:

```env
MONGODB_URI="your_mongodb_connection_string"
DB_NAME="product_catalog"
API_KEY="your_strong_unique_api_key"
```

Replace the placeholder values with your actual MongoDB Atlas connection string and a strong, unique API key.

Keep your credentials private. Do not commit the `.env` file to version control. Ensure your `.gitignore` includes:

```gitignore
node_modules/
.env
```

The application loads these environment variables using dotenv.

### 5. Start the server

Run the following command in the project directory:

```bash
node server.js
```

The server should connect to MongoDB before starting to accept requests. Check the terminal for the application's startup message.

By default, the API is accessible locally at:

`http://localhost:3000`

Keep the terminal running while testing the API.

## API Endpoints

All endpoints use the base URL:

`http://localhost:3000`

| Method | Endpoint                         | Description                                                        | Authentication   |
| ------ | -------------------------------- | ------------------------------------------------------------------ | ---------------- |
| GET    | `/api/products`                  | Retrieve products, with optional search, filtering, and pagination | Not required     |
| GET    | `/api/products/:id`              | Retrieve a specific product                                        | Not required     |
| POST   | `/api/products`                  | Create a product                                                   | API key required |
| PATCH  | `/api/products/:id`              | Update selected fields of a product                                | API key required |
| DELETE | `/api/products/:id`              | Delete a product                                                   | API key required |
| GET    | `/api/products/stats/categories` | Retrieve category statistics                                       | Not required     |

Replace `:id` with the actual MongoDB `_id` of the product.

### Retrieve all products

**Request**

```http
GET /api/products
```

Example:

```text
http://localhost:3000/api/products
```

The response contains a `data` array of products and a `pagination` object with information about the current page and total results.

### Search and filter products

The products endpoint accepts optional query parameters:

- `search` — Search product names, case-insensitively.
- `category` — Filter by category.
- `page` — Select the page number; defaults to `1`.
- `limit` — Set the number of products per page; defaults to `10` and cannot exceed `100`.

Examples:

```text
GET /api/products?search=headphones
GET /api/products?category=Electronics
GET /api/products?page=2&limit=5
GET /api/products?search=keyboard&category=Electronics&page=1&limit=10
```

Search and category filters can be combined with pagination.

### Retrieve a product by ID

**Request**

```http
GET /api/products/:id
```

Example:

```text
GET http://localhost:3000/api/products/REPLACE_WITH_PRODUCT_ID
```

Use an actual `_id` returned by the API. Invalid IDs return a `400 Bad Request` response, while valid IDs that do not match a product return `404 Not Found`.

### Create a product

**Request**

```http
POST /api/products
```

In Postman, configure the following:

- Method: `POST`
- URL: `http://localhost:3000/api/products`
- Header: `x-api-key` with the API key configured in `.env`
- Body: **raw → JSON**

Example request body:

```json
{
	"name": "Wireless Mouse",
	"description": "Wireless computer mouse",
	"price": 250,
	"category": "Electronics",
	"stock": 10
}
```

A successful request returns `201 Created` with the created product and its generated ID.

### Update a product

**Request**

```http
PATCH /api/products/:id
```

Include the `x-api-key` header and a JSON body containing only the fields you want to change.

Example:

```json
{
	"price": 275,
	"stock": 15
}
```

Use a real product ID in the URL. A successful request returns the updated product.

### Delete a product

**Request**

```http
DELETE /api/products/:id
```

Include the `x-api-key` header and the product ID in the URL.

Example:

```text
DELETE http://localhost:3000/api/products/REPLACE_WITH_PRODUCT_ID
```

A successful request returns a confirmation response. The request does not require a JSON body.

### Retrieve category statistics

**Request**

```http
GET /api/products/stats/categories
```

This endpoint uses MongoDB's aggregation pipeline to group products by category and calculate:

- `productCount` — Number of products in the category.
- `averagePrice` — Average product price in the category.
- `totalStock` — Combined stock quantity in the category.

Results are sorted by product count in descending order.

## Testing with Postman

1. Start the server using `node server.js`.
2. Create a new request in Postman.
3. Enter `http://localhost:3000` followed by the endpoint path.
4. Select the correct HTTP method.
5. For POST, PATCH, and DELETE requests, add the `x-api-key` header with your configured API key.
6. For POST and PATCH requests, select **Body → raw → JSON** and provide a valid JSON object.
7. Click **Send** and inspect the status code and response body.

### Suggested testing checklist

- [ ] Retrieve the product list.
- [ ] Search by product name.
- [ ] Filter by category.
- [ ] Test pagination with different page and limit values.
- [ ] Retrieve an existing product by ID.
- [ ] Test invalid and nonexistent product IDs.
- [ ] Create a product with a valid API key.
- [ ] Confirm a request without a valid API key is rejected.
- [ ] Update a product's price or stock.
- [ ] Delete a test product.
- [ ] Retrieve category statistics.
- [ ] Test invalid product data and invalid pagination parameters.

## Error Handling

The API uses HTTP status codes to communicate the outcome of requests. Common responses include:

| Status code                 | Meaning                                              |
| --------------------------- | ---------------------------------------------------- |
| `200 OK`                    | Request completed successfully.                      |
| `201 Created`               | Product created successfully.                        |
| `400 Bad Request`           | Invalid input, product ID, or query parameter.       |
| `401 Unauthorized`          | Missing or invalid API key for a protected endpoint. |
| `404 Not Found`             | Product or requested route not found.                |
| `500 Internal Server Error` | An unexpected server-side error occurred.            |

The response body includes an error message for requests that fail validation or encounter an error.

## Security Notes

- Store database credentials and API keys in environment variables.
- Keep `.env` out of version control.
- Validate incoming product data and query parameters.
- Use API key middleware to protect write operations.
- Use appropriate MongoDB database permissions and network access restrictions.

**Note:** The API key mechanism is a basic security measure for this project. A production application would need a more comprehensive authentication and authorization strategy, along with additional security controls.
