// src/index.js

// Import core dependencies
const express = require("express");
const cors = require("cors");

// Import Prisma Client to interact with the database
const { PrismaClient } = require("@prisma/client");

// Create a new PrismaClient instance
const prisma = new PrismaClient();

// Create an Express application
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS (so other apps, like a frontend, can call this API)
app.use(cors());

/**
 * Simple health-check endpoint
 * Useful to quickly see if the server is running
 */
app.get("/", (req, res) => {
  res.json({ message: "Books API is running 🚀" });
});

/**
 * GET /api/books
 * Fetch all books from the database
 */
app.get("/api/books", async (req, res) => {
  try {
    // Use Prisma to get all Book records
    const books = await prisma.book.findMany({
      orderBy: { createdAt: "desc" }, // Newest first
    });

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
    // Get ID from request params and convert it to a number
    const id = Number(req.params.id);

    // Find the book with this ID
    const book = await prisma.book.findUnique({ where: { id } });

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    console.error("Error fetching book:", error);
    res.status(500).json({ error: "Failed to fetch book" });
  }
});

/**
 * POST /api/books
 * Create a new book
 *
 * Expected JSON body:
 * {
 *   "title": "Book title",
 *   "author": "Author name",
 *   "year": 2023
 * }
 */
app.post("/api/books", async (req, res) => {
  try {
    const { title, author, year } = req.body;

    // Basic validation
    if (!title || !author) {
      return res
        .status(400)
        .json({ error: "Title and author are required fields" });
    }

    // Create a new Book record
    const newBook = await prisma.book.create({
      data: {
        title,
        author,
        // Only set year if it's provided
        year: year ? Number(year) : null,
      },
    });

    res.status(201).json(newBook);
  } catch (error) {
    console.error("Error creating book:", error);
    res.status(500).json({ error: "Failed to create book" });
  }
});

/**
 * PUT /api/books/:id
 * Update an existing book
 */
app.put("/api/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { title, author, year } = req.body;

    // First, check if the book exists
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Update the book with the new values
    const updatedBook = await prisma.book.update({
      where: { id },
      data: {
        title: title ?? existingBook.title,
        author: author ?? existingBook.author,
        year: year !== undefined ? Number(year) : existingBook.year,
      },
    });

    res.json(updatedBook);
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

    // Check if the book exists
    const existingBook = await prisma.book.findUnique({ where: { id } });

    if (!existingBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    // Delete it
    await prisma.book.delete({ where: { id } });

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Failed to delete book" });
  }
});

// Define the port where the server will listen
const PORT = process.env.PORT || 4000;

// Start the Express server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
