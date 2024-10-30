const sqlite3 = require("sqlite3").verbose();

// Create an in-memory SQLite database
const db = new sqlite3.Database(':memory:', (err) => {
  if (err) {
    console.error("Error connecting to the in-memory database:", err);
  } else {
    console.log("Connected to the in-memory SQLite database!");
  }
});

// Function to set up database schema and initial data
function initializeDatabase() {
  db.serialize(() => {
    // Create tables
    db.run(`CREATE TABLE user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        contactNumber TEXT,
        email TEXT UNIQUE,
        password TEXT,
        status BOOLEAN DEFAULT FALSE,
        role TEXT
    )`);

    db.run(`CREATE TABLE category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
    )`);

    db.run(`CREATE TABLE product (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        categoryId INTEGER NOT NULL,
        description TEXT,
        price INTEGER,
        status TEXT,
        FOREIGN KEY (categoryId) REFERENCES category(id)
    )`);

    db.run(`CREATE TABLE bill (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        uuid TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        contactNumber TEXT NOT NULL,
        paymentMethod TEXT NOT NULL,
        total REAL NOT NULL,
        productDetails TEXT, -- JSON is stored as TEXT in SQLite
        createdBy TEXT NOT NULL
    )`);

    // Insert initial data
    db.run(`INSERT INTO user (name, contactNumber, email, password, status, role)
            VALUES ('admin', '0731062846', 'hodamadadi5@gmail.com', '12345678', 1, 'admin')`);

    console.log("Database initialized with tables and initial data.");
  });
}

// Initialize the database on startup
initializeDatabase();

module.exports = db;
