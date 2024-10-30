// require("dotenv").config();

// function checkRole(req, res, next) {
//   if (res.locals.role == process.env.USER) res.sendStatus(401);
//   else next();
// }

// module.exports = { checkRole: checkRole };
function checkRole(req, res, next) {
  const user = req.user; // Assuming the user info is stored in req.user by authenticateToken

  if (user && user.role === "admin") { // Adjust this condition based on your roles
    next(); // User is authorized, proceed to the next middleware/route
  } else {
    return res.status(403).json({ message: "Forbidden: You don't have permission to perform this action." });
  }
}

module.exports = { checkRole };
