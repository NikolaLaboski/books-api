// src/index.js

// Import core dependencies
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

// Create an Express application
const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "localhost",
  user: "root",         
  password: "",         
  database: "books_db",  
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Simple health check route
app.get("/", (req, res) => {
  res.json({ message: "Books API with MySQL is running 🚀" });
});

/**
 * Helper function: map DB row to API response object
 * - Converts snake_case (published_year) to camelCase (publishedYear)
 */
function mapBookRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    description: row.description,
    publishedYear: row.published_year,
    pages: row.pages,
    language: row.language,
    created_at: row.created_at,
  };
}

/**
 * GET /api/books
 * Fetch all books from the database
 */
app.get("/api/books", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `
      SELECT 
        id,
        title,
        author,
        description,
        published_year,
        pages,
        language,
        created_at
      FROM books
      ORDER BY created_at DESC
      `
    );

    const books = rows.map(mapBookRow);
    res.json(books);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Failed to fetch books" });
  }
});

/**
 * GET /api/books/:id
 * Fetch a single book by its ID
 */
app.get("/api/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        title,
        author,
        description,
        published_year,
        pages,
        language,
        created_at
      FROM books
      WHERE id = ?
      `,
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(mapBookRow(rows[0]));
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

/**
 * POST /api/books
 * Create a new book
 * Expected JSON body:
 * {
 *   "title": "Clean Code",
 *   "author": "Robert C. Martin",
 *   "description": "Some text...",
 *   "publishedYear": 2008,
 *   "pages": 464,
 *   "language": "English"
 * }
 */
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, description, publishedYear, pages, language } =
      req.body;

    // Basic validation
    if (!title || !author) {
      return res
        .status(400)
        .json({ error: "Title and author are required fields" });
    }

    const [result] = await pool.query(
      `
      INSERT INTO books 
        (title, author, description, published_year, pages, language)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        title,
        author,
        description ?? null,
        publishedYear ?? null,
        pages ?? null,
        language ?? null,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        title,
        author,
        description,
        published_year,
        pages,
        language,
        created_at
      FROM books
      WHERE id = ?
      `,
      [result.insertId]
    );

    res.status(201).json(mapBookRow(rows[0]));
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
});

/**
 * PUT /api/books/:id
 * Update an existing book (partial update allowed)
 */
app.put("/api/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const { title, author, description, publishedYear, pages, language } =
      req.body;

    // Check if the book exists
    const [existingRows] = await pool.query(
      "SELECT * FROM books WHERE id = ?",
      [id]
    );

    if (existingRows.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    const current = existingRows[0];

    // Update with fallback to current values
    await pool.query(
      `
      UPDATE books
      SET
        title = ?,
        author = ?,
        description = ?,
        published_year = ?,
        pages = ?,
        language = ?
      WHERE id = ?
      `,
      [
        title ?? current.title,
        author ?? current.author,
        description ?? current.description,
        publishedYear !== undefined ? publishedYear : current.published_year,
        pages !== undefined ? pages : current.pages,
        language ?? current.language,
        id,
      ]
    );

    const [rows] = await pool.query(
      `
      SELECT 
        id,
        title,
        author,
        description,
        published_year,
        pages,
        language,
        created_at
      FROM books
      WHERE id = ?
      `,
      [id]
    );

    res.json(mapBookRow(rows[0]));
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Failed to update book" });
  }
});

/**
 * DELETE /api/books/:id
 * Delete a book by ID
 */
app.delete("/api/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (Number.isNaN(id)) {
      return res.status(400).json({ error: "Invalid book ID" });
    }

    const [existing] = await pool.query(
      "SELECT id FROM books WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({ error: "Book not found" });
    }

    await pool.query("DELETE FROM books WHERE id = ?", [id]);

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// Choose a port
const PORT = process.env.PORT || 4000;

app.listen(PORT, async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database");
    connection.release();
  } catch (error) {
    console.error("❌ Failed to connect to MySQL:", error);
  }

  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
