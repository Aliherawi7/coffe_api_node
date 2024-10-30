const express = require("express");
const connection = require("../connection");
const router = express.Router();
var auth = require("../services/authentication");

// Function to execute a query and return a promise
const queryAsync = (query, params) => {
  return new Promise((resolve, reject) => {
    connection.all(query, params, (err, rows) => {
      if (err) {
        console.error(err);
        return reject(err);
      }
      resolve(rows); // Return rows directly here
    });
  });
};

// GET route for dashboard details
router.get("/details", auth.authenticateToken, async (req, res) => {
  try {
    const categoryCountResult = await queryAsync(
      "SELECT COUNT(id) AS categoryCount FROM category",
      []
    );
    const productCountResult = await queryAsync(
      "SELECT COUNT(id) AS productCount FROM product",
      []
    );
    const billCountResult = await queryAsync(
      "SELECT COUNT(id) AS billCount FROM bill",
      []
    );

    const categoryCount = categoryCountResult[0].categoryCount;
    const productCount = productCountResult[0].productCount;
    const billCount = billCountResult[0].billCount;

    // Return the dashboard data
    res.status(200).json({
      category: categoryCount,
      product: productCount,
      bill: billCount,
    });
  } catch (err) {
    console.error("Error fetching dashboard details:", err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the data." });
  }
});

module.exports = router;
