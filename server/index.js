require("dotenv").config();

const cors = require("cors");
const express = require("express");
const mongoose = require("mongoose");
const { notFound, errorHandler } = require("./middleware/errorHandler");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/movies", require("./routes/movies"));
app.use("/api/library", require("./routes/library"));
app.use("/api/categories", require("./routes/categories"));
app.use("/api/history", require("./routes/history"));
app.use("/api/stats", require("./routes/stats"));

app.get("/api/health", (req, res) => {
  res.json({ status: "WatchBox API running" });
});

// 404 + Error handler (last mein)
app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not set");
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB connected");
    app.listen(PORT, () => {
      console.log(`WatchBox API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start WatchBox API:", error);
    process.exit(1);
  }
}

startServer();