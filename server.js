const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

// Import routes and middleware
const leadRoutes = require("./routes/leads");
const errorHandler = require("./middleware/errorHandler");
// const competitorRoutes = require("./routes/competitor");
// const analyticsRoutes = require("./routes/analytics");
// const webhookRoutes = require("./routes/webhooks");
// const logger = require("./utils/logger");

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/ai-competitor")
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log("MongoDB connection error:", err));

// Routes
app.use("/api/leads", leadRoutes);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);
