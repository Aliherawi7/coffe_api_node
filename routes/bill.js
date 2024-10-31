// const express = require("express");
// const pool = require("../connection");
// const router = express.Router();
// const ejs = require("ejs");
// const pdf = require("html-pdf");
// const path = require("path");
// const fs = require("fs");
// const uuid = require("uuid");
// const auth = require("../services/authentication");

// // Route to generate PDF
// router.post("/generateReport", auth.authenticateToken, async (req, res) => {
//   const generatedUuid = uuid.v1();
//   const orderDetails = req.body;

//   console.log("Received order details:", orderDetails);

//   // Check for product details
//   if (!orderDetails.productDetails) {
//     return res.status(400).json({ message: "Product details are required." });
//   }

//   let productDetailsReport;
//   let total = 0; // Initialize total

//   // Parse product details and calculate total
//   try {
//     productDetailsReport = JSON.parse(orderDetails.productDetails).map(
//       (product) => {
//         const productTotal = (product.price * product.quantity).toFixed(2);
//         total += parseFloat(productTotal); // Accumulate total
//         return {
//           ...product,
//           total: productTotal,
//         };
//       }
//     );
//   } catch (error) {
//     return res.status(400).json({ message: "Invalid product details JSON." });
//   }

//   const query = `
//         INSERT INTO bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy)
//         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

//   try {
//     // Insert into database
//     const [result] = await pool.query(query, [
//       orderDetails.name,
//       generatedUuid,
//       orderDetails.email,
//       orderDetails.contactNumber,
//       orderDetails.paymentMethod,
//       total.toFixed(2), // Pass the calculated total
//       JSON.stringify(productDetailsReport),
//       res.locals.email,
//     ]);

//     // Render PDF
//     ejs.renderFile(
//       path.join(__dirname, "report.ejs"),
//       {
//         productDetails: productDetailsReport,
//         name: orderDetails.name,
//         email: orderDetails.email,
//         contactNumber: orderDetails.contactNumber,
//         paymentMethod: orderDetails.paymentMethod,
//         totalAmount: total.toFixed(2), // Pass the calculated total
//       },
//       (err, results) => {
//         if (err) {
//           console.error("Error rendering EJS:", err);
//           return res.status(500).json(err);
//         } else {
//           pdf
//             .create(results)
//             .toFile(`./generated_pdf/${generatedUuid}.pdf`, (err, data) => {
//               if (err) {
//                 console.error("Error creating PDF:", err);
//                 return res.status(500).json(err);
//               } else {
//                 return res.status(200).json({ uuid: generatedUuid });
//               }
//             });
//         }
//       }
//     );
//   } catch (err) {
//     console.error("SQL Error:", err);
//     return res.status(500).json(err);
//   }
// });

// // Route to get PDF
// router.post("/getPdf", auth.authenticateToken, async (req, res) => {
//   console.log("Incoming request to generate PDF:", req.body);
//   const orderDetails = req.body;
//   const pdfPath = `./generated_pdf/${orderDetails.uuid}.pdf`;

//   if (fs.existsSync(pdfPath)) {
//     res.contentType("application/pdf");
//     fs.createReadStream(pdfPath).pipe(res);
//   } else {
//     const productDetailsReport = JSON.parse(orderDetails.productDetails).map(
//       (product) => ({
//         ...product,
//         total: (product.price * product.quantity).toFixed(2),
//       })
//     );

//     ejs.renderFile(
//       path.join(__dirname, "report.ejs"),
//       {
//         productDetails: productDetailsReport,
//         name: orderDetails.name,
//         email: orderDetails.email,
//         contactNumber: orderDetails.contactNumber,
//         paymentMethod: orderDetails.paymentMethod,
//         totalAmount: total.toFixed(2), // You should also calculate total for this case
//       },
//       (err, results) => {
//         if (err) {
//           console.error("Error rendering EJS:", err);
//           return res.status(500).json(err);
//         } else {
//           pdf.create(results).toFile(pdfPath, (err, data) => {
//             if (err) {
//               console.error("Error creating PDF:", err);
//               return res.status(500).json(err);
//             } else {
//               res.contentType("application/pdf");
//               fs.createReadStream(pdfPath).pipe(res);
//             }
//           });
//         }
//       }
//     );
//   }
// });

// // Route to get all bills
// router.get("/getBills", auth.authenticateToken, async (req, res) => {
//   const query = "SELECT * FROM bill ORDER BY id DESC";

//   try {
//     const [results] = await pool.query(query); // Use pool.query here
//     return res.status(200).json(results);
//   } catch (err) {
//     console.error("Database query error:", err);
//     return res.status(500).json(err);
//   }
// });

// // Route to delete a bill
// router.delete("/delete/:id", auth.authenticateToken, async (req, res) => {
//   const id = req.params.id;
//   const query = "DELETE FROM bill WHERE id = ?";

//   try {
//     const [results] = await pool.query(query, [id]); // Use pool.query here
//     if (results.affectedRows === 0) {
//       return res.status(404).json({ message: "Bill ID not found!" });
//     }
//     return res.status(200).json({ message: "Bill deleted successfully!" });
//   } catch (err) {
//     console.error("Database deletion error:", err);
//     return res.status(500).json(err);
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const ejs = require("ejs");
const pdf = require("html-pdf");
const path = require("path");
const fs = require("fs");
const uuid = require("uuid");
const auth = require("../services/authentication");

// Create a new SQLite database in memory
const db = require("../connection");


// Route to generate PDF
router.post("/generateReport", auth.authenticateToken, async (req, res) => {
  const generatedUuid = uuid.v1();
  const orderDetails = req.body;

  console.log("Received order details:", orderDetails);

  if (!orderDetails.productDetails) {
    return res.status(400).json({ message: "Product details are required." });
  }

  let productDetailsReport;
  let total = 0;

  try {
    productDetailsReport = JSON.parse(orderDetails.productDetails).map(
      (product) => {
        const productTotal = (product.price * product.quantity).toFixed(2);
        total += parseFloat(productTotal);
        return {
          ...product,
          total: productTotal,
        };
      }
    );
  } catch (error) {
    return res.status(400).json({ message: "Invalid product details JSON." });
  }

  const query = `
        INSERT INTO bill (name, uuid, email, contactNumber, paymentMethod, total, productDetails, createdBy) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  try {
    const createdByEmail = res.locals.email;

    // Insert into database
    db.run(query, [
      orderDetails.name,
      generatedUuid,
      orderDetails.email,
      orderDetails.contactNumber,
      orderDetails.paymentMethod,
      total.toFixed(2),
      JSON.stringify(productDetailsReport),
      createdByEmail,
    ], function (err) {
      if (err) {
        console.error("SQL Error:", err);
        return res.status(500).json(err);
      }

      ejs.renderFile(
        path.join(__dirname, "report.ejs"),
        {
          productDetails: productDetailsReport,
          name: orderDetails.name,
          email: orderDetails.email,
          contactNumber: orderDetails.contactNumber,
          paymentMethod: orderDetails.paymentMethod,
          totalAmount: total.toFixed(2),
        },
        (err, results) => {
          if (err) {
            console.error("Error rendering EJS:", err);
            return res.status(500).json(err);
          } else {
            pdf
              .create(results)
              .toFile(`./generated_pdf/${generatedUuid}.pdf`, (err, data) => {
                if (err) {
                  console.error("Error creating PDF:", err);
                  return res.status(500).json(err);
                } else {
                  return res.status(200).json({ uuid: generatedUuid });
                }
              });
          }
        }
      );
    });
  } catch (err) {
    console.error("SQL Error:", err);
    return res.status(500).json(err);
  }
});

// Route to get PDF
router.post("/getPdf", auth.authenticateToken, async (req, res) => {
  console.log("Incoming request to generate PDF:", req.body);
  const orderDetails = req.body;
  const pdfPath = `./generated_pdf/${orderDetails.uuid}.pdf`;

  if (fs.existsSync(pdfPath)) {
    res.contentType("application/pdf");
    fs.createReadStream(pdfPath).pipe(res);
  } else {
    const productDetailsReport = JSON.parse(orderDetails.productDetails).map(
      (product) => ({
        ...product,
        total: (product.price * product.quantity).toFixed(2),
      })
    );

    const total = productDetailsReport
      .reduce((acc, product) => acc + parseFloat(product.total), 0)
      .toFixed(2);

    ejs.renderFile(
      path.join(__dirname, "report.ejs"),
      {
        productDetails: productDetailsReport,
        name: orderDetails.name,
        email: orderDetails.email,
        contactNumber: orderDetails.contactNumber,
        paymentMethod: orderDetails.paymentMethod,
        totalAmount: total,
      },
      (err, results) => {
        if (err) {
          console.error("Error rendering EJS:", err);
          return res.status(500).json(err);
        } else {
          pdf.create(results).toFile(pdfPath, (err, data) => {
            if (err) {
              console.error("Error creating PDF:", err);
              return res.status(500).json(err);
            } else {
              res.contentType("application/pdf");
              fs.createReadStream(pdfPath).pipe(res);
            }
          });
        }
      }
    );
  }
});

// Route to get all bills
router.get("/getBills", auth.authenticateToken, async (req, res) => {
  const query = "SELECT * FROM bill ORDER BY id DESC";

  db.all(query, [], (err, rows) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).json(err);
    }
    return res.status(200).json(rows);
  });
});

// Route to delete a bill
router.delete("/delete/:id", auth.authenticateToken, async (req, res) => {
  const id = req.params.id;
  const query = "DELETE FROM bill WHERE id = ?";

  db.run(query, [id], function (err) {
    if (err) {
      console.error("Database deletion error:", err);
      return res.status(500).json(err);
    }
    if (this.changes === 0) {
      return res.status(404).json({ message: "Bill ID not found!" });
    }
    return res.status(200).json({ message: "Bill deleted successfully!" });
  });
});

module.exports = router;