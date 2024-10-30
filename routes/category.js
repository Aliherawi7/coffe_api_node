const express = require("express");
const router = express.Router();
const auth = require("../services/authentication");
const checkRole = require("../services/checkRole");

// Connect to the SQLite in-memory database
const db = require("../connection");;

// Function to execute a query and return a promise
const queryAsync = ((query, params) => {
  return new Promise((resolve, reject) => {
    db.all(query, params, (err, rows) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      resolve(rows);
    });
  });
});

// Add a new category
router.post("/add", auth.authenticateToken, checkRole.checkRole, async (req, res) => {
  const category = req.body;

  // Log the incoming request
  console.log("Incoming request to add category:", category);

  const query = "INSERT INTO category (name) VALUES (?)";
  try {
    await queryAsync(query, [category.name]);
    return res.status(201).json({ message: "Category Added Successfully!" });
  } catch (err) {
    console.error("Error adding category:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get all categories
router.get("/get", auth.authenticateToken, async (req, res) => {
  const query = "SELECT * FROM category ORDER BY name";
  try {
    const results = await queryAsync(query, []);
    return res.status(200).json(results);
  } catch (err) {
    console.error("Error fetching categories:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// Update category
router.patch("/update", auth.authenticateToken, checkRole.checkRole, async (req, res) => {
  const product = req.body;

  // Log the incoming request for updating category
  console.log("Incoming request to update category:", product);

  const query = "UPDATE category SET name = ? WHERE id = ?";
  try {
    const results = await queryAsync(query, [product.name, product.id]);
    if (results.changes === 0) {
      return res.status(404).json({ message: "Category ID not found!" });
    }
    return res.status(200).json({ message: "Category Updated Successfully!" });
  } catch (err) {
    console.error("Error updating category:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = router;
