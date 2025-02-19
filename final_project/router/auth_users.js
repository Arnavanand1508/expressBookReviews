const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid
const isValid = (username) => {
  return users.some((user) => user.username === username);
};

// Check if the username and password match the records
const authenticatedUser = (username, password) => {
  return users.some((user) => user.username === username && user.password === password);
};

// Task 7: Login as a Registered User
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  if (authenticatedUser(username, password)) {
    const accessToken = jwt.sign({ data: username }, "access", { expiresIn: 3600 });
    req.session.authorization = { accessToken, username };
    return res.status(200).json({ message: "User successfully logged in", accessToken });
  } else {
    return res.status(401).json({ message: "Invalid username or password" });
  }
});

// Task 8: Add or Modify a Book Review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.session.authorization.username;

  if (!review) {
    return res.status(400).json({ message: "Review is required" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({ message: "Review successfully posted", reviews: books[isbn].reviews });
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

// Task 9: Delete a Book Review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (books[isbn]) {
    if (books[isbn].reviews[username]) {
      delete books[isbn].reviews[username];
      return res.status(200).json({ message: "Review successfully deleted", reviews: books[isbn].reviews });
    } else {
      return res.status(404).json({ message: "No review found for this user" });
    }
  } else {
    return res.status(404).json({ message: `ISBN ${isbn} not found` });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;