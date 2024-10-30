// authentication.js
require("dotenv").config();
const jwt = require("jsonwebtoken");
const crypto = require('crypto');
// Generate a random 256-bit (32 bytes) secret
const secret = crypto.randomBytes(32).toString('hex') || process.env.ACCESS_TOKEN_SECRET;


function authenticateToken(req, res, next) {
  // Get the authorization header
  const authHeader = req.headers["authorization"];
  // Extract the token from the header
  const token = authHeader && authHeader.split(" ")[1];

  // If there's no token, respond with 401 Unauthorized
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  // Verify the token using the secret
  jwt.verify(token, secret, (err, user) => {
    // If token is invalid, respond with 403 Forbidden
    if (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    // Store the user info in req.user for later use
    req.user = user;

    // Additionally, set the user's email in res.locals for easy access
    res.locals.email = user.email; // Assuming the token payload contains the email

    // Continue to the next middleware or route handler
    next();
  });
}

module.exports = { authenticateToken, secret };

// require("dotenv").config();
// const jwt = require("jsonwebtoken");

// function authenticateToken(req, res, next) {
//   // Get the authorization header
//   const authHeader = req.headers["authorization"];
//   // Extract the token from the header
//   const token = authHeader && authHeader.split(" ")[1];

//   // If there's no token, respond with 401 Unauthorized
//   if (!token) {
//     return res.status(401).json({ message: "No token provided" });
//   }

//   // Verify the token using the secret
//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     // If token is invalid, respond with 403 Forbidden
//     if (err) {
//       return res.status(403).json({ message: "Invalid token" });
//     }

//     // Store the user info in req.user for later use
//     req.user = user;

//     // Continue to the next middleware or route handler
//     next();
//   });
// }

// module.exports = { authenticateToken };
