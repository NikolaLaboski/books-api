# Books API

A simple and clean **REST API** built with **Node.js**, **Express**, and **MySQL**.  
This project demonstrates how to build a real backend service with CRUD operations,
a relational database, and a clean API structure.

The API can be used by any frontend application (React, mobile apps, etc.)

---

## 🚀 Features

- Create, Read, Update, Delete (CRUD) books
- RESTful API endpoints with Express.js
- MySQL relational database (via mysql2)
- Input validation and error handling
- Clean and well-commented code
- Ready for deployment or further expansion

---

## 🛠️ Technologies Used

- **Node.js**
- **Express.js**
- **MySQL**
- **mysql2**
- **Nodemon** (development)

---

## 📚 Book Model

Each book contains the following fields:

- `id`
- `title`
- `author`
- `description`
- `publishedYear`
- `pages`
- `language`
- `createdAt`

---

## 📦 API Endpoints

Base URL:
http://localhost:4000

### Get all books
GET /api/books

### Get a single book by ID
GET /api/books/:id

### Create a new book
POST /api/books

Example request body:
```json
{
  "title": "Clean Code",
  "author": "Robert C. Martin",
  "description": "A handbook of agile software craftsmanship.",
  "publishedYear": 2008,
  "pages": 464,
  "language": "English"
}

Update a book

PUT /api/books/:id

Delete a book

DELETE /api/books/:id

⚙️ Getting Started
1️⃣ Install dependencies
npm install

2️⃣ Create MySQL database
Create a database named books_db and a books table.

3️⃣ Start the server
npm run dev
Server will run at:

http://localhost:4000

✅ Project Status

✔ Backend-only REST API project

👤 Author
Nikolche Laboski
Backend / Full-Stack Developer
GitHub: https://github.com/NikolaLaboski