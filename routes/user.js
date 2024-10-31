const express = require("express");
const connection = require("../connection"); // Ensure this connects to your SQLite database
const router = express.Router();
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { secret } = require("../services/authentication");

console.log('secret ', secret);


dotenv.config();
const saltRounds = 10;
const auth = require("../services/authentication");
const checkRole = require("../services/checkRole");

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

// Signup route
router.post("/signup", async (req, res) => {
  const { name, contactNumber, email, password } = req.body;

  if (!name || !contactNumber || !email || !password) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const query = "SELECT email FROM user WHERE email=?";
    const results = await connection.all(query, [email]); // No destructuring

    if (results.length > 0) {
      return res.status(400).json({ message: "Email already exists!" });
    }

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const insertQuery =
      "INSERT INTO user (name, contactNumber, email, password, status, role) VALUES (?, ?, ?, ?, 'false', 'user')";
    await connection.run(insertQuery, [
      name,
      contactNumber,
      email,
      hashedPassword, // Use hashed password here
    ]);
    res.status(200).json({ message: "Successfully registered!" });
  } catch (err) {
    console.error("Error during signup:", err);
    res.status(500).json({ message: "Database query error", error: err });
  }
});


// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);


  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const query =
      "SELECT email, password, role, status FROM user WHERE email=?";
    // Sample query

    const results = await new Promise((resolve, reject) => {
      connection.all(query, [email], (err, rows) => {
        if (err) {
          console.error(err);
          return reject(err);
        }
        console.log('Rows:', rows);
        resolve(rows); // Return rows directly here
      });
    });

    console.log('reuslts ,', results);

    if (!results || results.length === 0) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    const user = results[0];



    // const isMatch = await bcrypt.compare(password, user.password);
    // if (!isMatch) {
    console.log('match pass: ', user.password == password);

    if (user.password != password) {
      return res
        .status(401)
        .json({ message: "Incorrect username or password" });
    }

    if (user.status === "false") {
      return res.status(401).json({ message: "Wait for admin approval" });
    }

    const response = { email: user.email, role: user.role };
    console.log('keys: ', response, process.env.ACCESS_TOKEN_SECRET);

    const accessToken = jwt.sign(response, secret, {
      expiresIn: "8h",
    });

    res.status(200).json({ token: accessToken });
  } catch (err) {
    console.error("Error in login:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// Forgot Password route
router.post("/forgotPassword", (req, res) => {
  const user = req.body;

  if (!user.email) {
    return res.status(400).json({ message: "Email is required." });
  }

  const query = "SELECT email, password FROM user WHERE email=?";
  connection.all(query, [user.email], (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json({ message: "Database error occurred." });
    }

    if (results.length <= 0) {
      return res.status(404).json({ message: "Email not found." });
    } else {
      const mailOptions = {
        from: process.env.EMAIL,
        to: results[0].email,
        subject: "Password by Cafe Management System.",
        html: `
          <p><b>Your Login details for Cafe Management System</b><br>
          <b>Email:</b> ${results[0].email}<br>
          <b>Password:</b> ${results[0].password}<br>
          <a href="http://localhost:4200/">Click here to login</a></p>
        `,
      };

      transporter.sendMail(mailOptions, (error) => {
        if (error) {
          console.error("Error sending email:", error);
          return res.status(500).json({ message: "Failed to send email." });
        } else {
          return res.status(200).json({ message: "Password sent successfully to your email." });
        }
      });
    }
  });
});

// Get Users route
router.get("/get", async (req, res) => {
  const query =
    "SELECT id, name, email, contactNumber, status FROM user WHERE role = 'user'";

  try {
    console.log("Fetching users...");
    const [results] = await connection.all(query);

    if (results.length === 0) {
      return res.status(200).json([]);
    }

    return res.status(200).json(results);
  } catch (err) {
    console.error("Database query error:", err);
    return res.status(500).json({
      error: "An error occurred while fetching users.",
      details: err.message,
    });
  }
});

// Update User Status route
router.patch("/update", (req, res) => {
  let user = req.body;

  if (!user.id || !user.status) {
    return res.status(400).json({ message: "User ID and status are required" });
  }

  var query = "UPDATE user SET status=? WHERE id=?";
  connection.run(query, [user.status, user.id], (err) => {
    if (err) {
      console.error("Database error:", err);
      return res.status(500).json({ message: "Database error", error: err });
    }

    return res.status(200).json({ message: "User updated successfully!" });
  });
});

// Check Token route
router.get("/checkToken", auth.authenticateToken, (req, res) => {
  res.status(200).json({ message: "Token is valid" });
});

// Change Password route
router.post("/changePassword", auth.authenticateToken, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const email = res.locals.email;

  if (!oldPassword || !newPassword) {
    return res
      .status(400)
      .json({ message: "Old and new passwords are required" });
  }

  try {
    const query = "SELECT * FROM user WHERE email=?";
    const [results] = await connection.all(query, [email]);

    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(oldPassword, results[0].password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect old password!" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);
    const updateQuery = "UPDATE user SET password=? WHERE email=?";
    await connection.run(updateQuery, [hashedNewPassword, email]);

    res.status(200).json({ message: "Password updated successfully!" });
  } catch (err) {
    console.error("Error updating password:", err);
    res.status(500).json({ message: "Error updating password", error: err });
  }
});

module.exports = router;
