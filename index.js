import "dotenv/config";
import express from "express";
import cors from "cors";
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Create products table if not exists
(async () => {
  await sql`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      price NUMERIC(10, 2) NOT NULL
    )
  `;
})();

// GET all products
app.get("/api/products", async (req, res) => {
  const result = await sql`SELECT * FROM products ORDER BY id ASC`;
  res.json(result);
});

// POST a new product
app.post("/api/products", async (req, res) => {
  const { name, category, price } = req.body;
  const result = await sql`
    INSERT INTO products (name, category, price)
    VALUES (${name}, ${category}, ${price})
    RETURNING *
  `;
  res.json(result[0]);
});

// PUT update a product by id
app.put("/api/products/:id", async (req, res) => {
  const id = req.params.id;
  const { name, category, price } = req.body;
  const result = await sql`
    UPDATE products
    SET name = ${name}, category = ${category}, price = ${price}
    WHERE id = ${id}
    RETURNING *
  `;
  res.json(result[0]);
});

// DELETE a product by id
app.delete("/api/products/:id", async (req, res) => {
  const id = req.params.id;
  await sql`DELETE FROM products WHERE id = ${id}`;
  res.json({ message: "Product deleted" });
});

app.listen(port, () => {
  console.log(`Product API server running at http://localhost:${port}`);
});
