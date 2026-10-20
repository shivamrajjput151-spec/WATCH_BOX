require('dotenv').config();

const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use("/api/auth", require("./routes/auth"));

app.get('/api/health', (req, res) => {
  res.json({ status: 'WatchBox API running' });
});

async function startServer() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error('MONGO_URI is not set. Add it to server/.env.');
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    app.listen(PORT, () => {
      console.log(`WatchBox API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start WatchBox API:', error);
    process.exit(1);
  }
}

startServer();
