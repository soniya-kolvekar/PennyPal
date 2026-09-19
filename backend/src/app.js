const express = require('express');
const cors = require('cors');

const chatbotRoutes = require("./routes/chatbot.routes");
const authRoutes = require('./routes/auth.routes');
const analyzeRoutes = require("./routes/analyze.routes");

const {
  getDatabaseInfo,
} = require("./config/db");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);


app.get("/", (req, res) => {
  res.json({
    message: "PennyPal backend is running!"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "PennyPal backend is healthy",
    timestamp: new Date().toISOString()
  });
});


app.get("/api/db", (req, res) => {
  res.json({
    success: true,
    database: getDatabaseInfo(),
  });
});

app.use("/api/chat", chatbotRoutes);

app.use("/api/analyze", analyzeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;

