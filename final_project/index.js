const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

// Session middleware for authenticated routes
app.use("/customer", session({
  secret: "fingerprint_customer",
  resave: true,
  saveUninitialized: true
}));

// Middleware to verify JWT token for authenticated routes
app.use("/customer/auth/*", function auth(req, res, next) {
    if (req.session.authorization) {
      const token = req.session.authorization['accessToken'];
      jwt.verify(token, "access", (err, user) => {
        if (!err) {
          req.user = user;
          next();
        } else {
          return res.status(403).json({ message: "User not authenticated" });
        }
      });
    } else {
      return res.status(403).json({ message: "User not logged in" });
    }
  });

const PORT = 5000;

// Mount routes
app.use("/customer", customer_routes); // Authenticated routes
app.use("/", genl_routes); // Public routes

app.listen(PORT, () => console.log("Server is running on port 5000"));