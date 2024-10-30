
// Import required modules
const express = require("express");
const bodyParser = require("body-parser");
const http = require("http");
const dotenv = require("dotenv");
const cors = require("cors");
const morgan = require("morgan"); // For logging
const connection = require("./connection");
const userRoute = require("./routes/user");
const categoryRoute = require("./routes/category");
const productRoute = require("./routes/product");
const billRoute = require("./routes/bill");
const dashboardRoute = require("./routes/dashboard");
const orderRoute = require("./routes/order"); // Import your order route
const transporter = require("./miler");


// Load environment variables
dotenv.config();

// Create an instance of express
const app = express();
const port = process.env.PORT || 7000;
const helmet = require('helmet');

// CORS configuration
const allowedOrigins = [
  "http://localhost:4200",
  "https://cafe-management-system-mauve.vercel.app",
];

const corsOptions = {
  origin: "https://cafe-management-system-mauve.vercel.app/", // Replace with your frontend's URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true, // Allow credentials (if needed)
  optionsSuccessStatus: 204,
};

// Middleware setup
app.use(cors(corsOptions)); // Enable CORS with options
app.use(morgan("dev")); // Log requests to the console
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(express.json()); // Parse JSON bodies

// Use routes
app.use("/user", userRoute);
app.use("/category", categoryRoute);
app.use("/product", productRoute);
app.use("/bill", billRoute);
app.use("/dashboard", dashboardRoute);
app.use("/order", orderRoute); // Use order routes

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});


app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    connectSrc: ["'self'", "https://cafe-management-system-mauve.vercel.app/"]
  }
}));

// Your other middleware and routes

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Create HTTP server
const server = http.createServer(app);

// Start server
server.listen(port, () => {
  console.log(`Server is running on port: :${port}`);
});




// Handle server errors
server.on("error", (error) => {
  console.error("Error starting server:", error.message);
});

// Graceful shutdown
process.on("SIGINT", () => {
  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });
});
