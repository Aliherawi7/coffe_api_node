const express = require("express");
const router = express.Router();
const auth = require("../services/authentication");
const checkRole = require("../services/checkRole");
const db = require("../connection"); // Import the SQLite connection

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

// Add new products
router.post("/add", auth.authenticateToken, checkRole.checkRole, async (req, res) => {
  console.log("Received product data:", req.body);
  let products = req.body;

  const query =
    "INSERT INTO product (name, categoryId, description, price, status) VALUES (?, ?, ?, ?, 'true')";

  try {
    if (!Array.isArray(products) && typeof products !== "object") {
      return res.status(400).json({ message: "No products to add." });
    }

    if (typeof products === "object") {
      products = [products];
    }

    const promises = products.map((product) => {
      const errors = [];
      if (!product.name) errors.push("Name is required.");
      if (!product.categoryId) errors.push("Category ID is required.");
      if (product.price == null) errors.push("Price is required.");

      if (errors.length > 0) {
        return Promise.reject({ message: errors.join(" ") });
      }

      return queryAsync(query, [
        product.name,
        product.categoryId,
        product.description || null,
        product.price,
      ]);
    });

    await Promise.all(
      promises.map((promise) => promise.catch((err) => ({ error: err.message })))
    ).then((results) => {
      const failed = results.filter((result) => result && result.error);
      if (failed.length > 0) {
        return res.status(400).json({
          message: `${failed.length} products failed to add.`,
          errors: failed,
        });
      }
      return res.status(201).json({ message: "All products added successfully!" });
    });
  } catch (err) {
    console.error("Error adding products:", err);
    return res.status(500).json({
      message: "An error occurred while adding products.",
      error: err.message,
    });
  }
});

// Get all products
router.get("/get", auth.authenticateToken, async (req, res) => {
  const query =
    "SELECT p.id, p.name, p.description, p.price, p.status, c.id AS categoryId, c.name AS categoryName FROM product AS p INNER JOIN category AS c ON p.categoryId = c.id";

  try {
    const results = await queryAsync(query, []);
    return res.status(200).json(results);
  } catch (err) {
    console.error("Error retrieving products:", err);
    return res.status(500).json({
      message: "An error occurred while retrieving products.",
      error: err.message,
    });
  }
});

// Get products by category ID
router.get("/getByCategory/:id", auth.authenticateToken, async (req, res) => {
  const query =
    "SELECT id, name FROM product WHERE categoryId = ? AND status = 'true'";
  const categoryId = req.params.id;

  try {
    const results = await queryAsync(query, [categoryId]);
    return res.status(200).json(results);
  } catch (err) {
    console.error("Error retrieving products by category:", err);
    return res.status(500).json({
      message: "An error occurred while retrieving products by category.",
      error: err.message,
    });
  }
});

// Get product by ID
router.get("/getById/:id", auth.authenticateToken, async (req, res) => {
  const id = req.params.id;
  const query = "SELECT id, name, description, price FROM product WHERE id = ?";

  try {
    const results = await queryAsync(query, [id]);
    if (results.length === 0) {
      return res.status(404).json({ message: "Product not found!" });
    }
    return res.status(200).json(results[0]);
  } catch (err) {
    console.error("Error retrieving product by ID:", err);
    return res.status(500).json({
      message: "An error occurred while retrieving the product.",
      error: err.message,
    });
  }
});

// Update product
router.patch("/update", auth.authenticateToken, checkRole.checkRole, async (req, res) => {
  const product = req.body;
  const query =
    "UPDATE product SET name = ?, categoryId = ?, price = ? WHERE id = ?";

  try {
    if (!product.name || !product.categoryId || product.price == null || !product.id) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const results = await queryAsync(query, [
      product.name,
      product.categoryId,
      product.price,
      product.id,
    ]);

    if (results.changes === 0) {
      return res.status(404).json({ message: "Product ID does not exist!" });
    }
    return res.status(200).json({ message: "Product updated successfully!" });
  } catch (err) {
    console.error("Error updating product:", err);
    return res.status(500).json({
      message: "An error occurred while updating the product.",
      error: err.message,
    });
  }
});

// Delete product
router.delete("/delete/:id", auth.authenticateToken, checkRole.checkRole, async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM product WHERE id = ?";

  try {
    const results = await queryAsync(query, [id]);

    if (results.changes === 0) {
      return res.status(404).json({ message: "Product ID does not exist!" });
    }
    return res.status(200).json({ message: "Product deleted successfully!" });
  } catch (err) {
    console.error("Error deleting product:", err);
    return res.status(500).json({
      message: "An error occurred while deleting the product.",
      error: err.message,
    });
  }
});

// Update product status
router.patch("/updateStatus", auth.authenticateToken, checkRole.checkRole, async (req, res) => {
  const product = req.body;
  const query = "UPDATE product SET status = ? WHERE id = ?";

  try {
    if (product.status == null || !product.id) {
      return res.status(400).json({ message: "Invalid product data" });
    }

    const results = await queryAsync(query, [product.status, product.id]);

    if (results.changes === 0) {
      return res.status(404).json({ message: "Product ID does not exist!" });
    }
    return res.status(200).json({ message: "Product status updated successfully!" });
  } catch (err) {
    console.error("Error updating product status:", err);
    return res.status(500).json({
      message: "An error occurred while updating product status.",
      error: err.message,
    });
  }
});

module.exports = router;
