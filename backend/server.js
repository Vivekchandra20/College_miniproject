/**
 * Main Server File
 * Initializes Express and Socket.IO server
 */

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const socketIO = require("socket.io");
const connectDB = require("./config/db");
const { initializeSocket } = require("./utils/socketHandlers");

// Import routes
const authRoutes = require("./routes/authRoutes");
const chatRoutes = require("./routes/chatRoutes");
const messageRoutes = require("./routes/messageRoutes");
const userRoutes = require("./routes/userRoutes");

// Initialize Express app
const app = express();
app.set("trust proxy", 1);

const DEFAULT_FRONTEND_URL = "https://messaging-frontend-412h.onrender.com";
const DEFAULT_ALLOWED_ORIGINS = [
  process.env.CLIENT_URL || DEFAULT_FRONTEND_URL,
  "http://localhost:5173",
  "http://localhost:5174",
];

const ALLOWED_ORIGINS = (
  process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(",")
    : DEFAULT_ALLOWED_ORIGINS
)
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server and health checks without browser origin.
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
      return;
    }

    callback(new Error("CORS origin not allowed"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
};

// Create HTTP server from Express app
const server = http.createServer(app);

// Initialize Socket.IO with specific options
const io = socketIO(server, {
  cors: {
    origin: ALLOWED_ORIGINS,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// Middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(cors(corsOptions));
app.options("*", cors(corsOptions));

// Connect to database
connectDB();

// Initialize Socket.IO handlers
initializeSocket(io);

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
    timestamp: new Date(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/users", userRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
    error: process.env.NODE_ENV === "development" ? err : {},
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const PUBLIC_API_URL =
  process.env.PUBLIC_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://messaging-backend-toob.onrender.com"
    : `http://localhost:${PORT}`);

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════╗
║  Real-Time Messaging Application Server    ║
╚════════════════════════════════════════════╝
📱 Server running on port: ${PORT}
🔗 API: ${PUBLIC_API_URL}
🌐 Client: ${process.env.CLIENT_URL || DEFAULT_FRONTEND_URL}
🛡️  Allowed Origins: ${ALLOWED_ORIGINS.join(", ")}
🗂️  Environment: ${process.env.NODE_ENV || "development"}
  `);
});

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT signal received: closing HTTP server");
  server.close(() => {
    console.log("HTTP server closed");
    process.exit(0);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
  process.exit(1);
});

module.exports = { app, io, server };
