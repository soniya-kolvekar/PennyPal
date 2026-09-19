<<<<<<< HEAD
const express = require('express');
const cors = require('cors');
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

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

app.get("/api/db", (req, res) => {
  res.json({
    success: true,
    database: getDatabaseInfo(),
  });
});

app.use("/api/analyze", analyzeRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
=======
const express = require("express");
const cors = require("cors");

const chatbotRoutes = require("./routes/chatbot.routes");

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: " backend is running!"
    });
});

app.use("/api/chat", chatbotRoutes);

module.exports = app;
>>>>>>> 2e56f9d0afadb4d295d11bf6ae6b2eef43decb15
