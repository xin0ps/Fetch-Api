const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../models/user");
const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;

// Edit user
router.put("/edit", authenticateToken, async (req, res) => {
  const userId = req.user.id;

  try {
    const status = await User.findByIdAndUpdate(userId, {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      email: req.body.email,
    });

    res.json(status ? "Successfully Updated" : "error happened");
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});




// Registration route
router.post('/register', async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;
    const passwordHash = await bcrypt.hash(password, 10);
    const user = new User({ firstname, lastname, email, passwordHash });
    await user.save();
    res.status(201).send('User registered successfully');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Login route
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).send("Invalid email or password");
  }
  const validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    return res.status(400).send("Invalid email or password");
  }
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign({ email: user.email }, REFRESH_TOKEN_SECRET);
  res.json({ accessToken, refreshToken });
});

// Refresh route
router.post("/refresh", (req, res) => {
  const refreshToken = req.body.refreshToken;
  if (!refreshToken) {
    return res.sendStatus(401);
  }
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    const accessToken = generateAccessToken({ email: user.email });
    res.json({ accessToken });
  });
});

// Middleware for verifying access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.sendStatus(401);
  }
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.sendStatus(403);
    }
    res.locals.user = user;
    req.user = user;
    next();
  });
}

// Helper function to generate access token
function generateAccessToken(user) {
  return jwt.sign({ email: user.email, id: user.id }, ACCESS_TOKEN_SECRET, {
    expiresIn: "5m",
  });
}

// Export the router
module.exports = router;

// Export the authenticateToken function
module.exports.authenticateToken = authenticateToken;
