require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const DATABASE_URL = process.env.DATABASE_URL;

const app = express();

app.use(express.json());
app.use(cors());




// Connect to MongoDB Atlas
mongoose
  .connect(DATABASE_URL)
  .then(() => console.log("Connected to MongoDB Atlas"))
  .catch((err) => console.error("Error connecting to MongoDB Atlas:", err));

// Use routes
app.use('/api/auth', authRoutes);

const path = require('path');
 
app.use(express.static(path.join(__dirname, "public")));


app.listen(4000, () => {
  console.log(`Server running on 4000`);
});
