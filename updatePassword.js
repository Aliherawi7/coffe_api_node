// const bcrypt = require("bcrypt");
// const connection = require("../connection"); // Adjust the path if necessary

// const email = "hodamadadi5@gmail.com"; // The email you want to update
// const plainPassword = "admin"; // The current plain text password
// const saltRounds = 10;

// async function updatePassword(email, plainPassword) {
//   try {
//     // Hash the password
//     const hash = await bcrypt.hash(plainPassword, saltRounds);

//     // Prepare the SQL query
//     const query = "UPDATE user SET password=? WHERE email=?";

//     // Update the password in the database
//     connection.query(query, [hash, email], (error, results) => {
//       if (error) {
//         console.error("Error updating password:", error);
//       } else {
//         console.log("Password updated successfully!");
//       }
//     });
//   } catch (err) {
//     console.error("Error hashing password:", err);
//   }
// }

// // Call the function to update the password
// updatePassword(email, plainPassword);
const bcrypt = require('bcrypt');
const connection = require('../connection'); // Adjust the path if necessary

const email = 'hodamadadi5@gmail.com'; // The email you want to update
const plainPassword = 'admin'; // The current plain text password
const saltRounds = 10;

async function updatePassword(email, plainPassword) {
    try {
        // Hash the password
        const hash = await bcrypt.hash(plainPassword, saltRounds);
        
        // Prepare the SQL query
        const query = "UPDATE user SET password=? WHERE email=?";
        
        // Update the password in the database
        connection.query(query, [hash, email], (error, results) => {
            if (error) {
                console.error("Error updating password:", error);
            } else {
                console.log("Password updated successfully!");
            }
        });
    } catch (err) {
        console.error("Error hashing password:", err);
    }
}

// Call the function to update the password
updatePassword(email, plainPassword);
