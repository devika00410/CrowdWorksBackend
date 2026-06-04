import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import blogCardRoutes from "./Routes/blogCardRoutes.js";
import blogDetailRoutes from "./Routes/blogDetailRoutes.js";
import projectCardRoutes from "./Routes/projectCardRoutes.js";
import projectDetailRoutes from "./Routes/projectDetailRoutes.js";
import serviceCardRoutes from "./Routes/serviceCardRoutes.js";
import serviceDetailRoutes from "./Routes/serviceDetailRoutes.js";
import contactRoutes from "./Routes/contactRoute.js";
import donationCardRoutes from "./Routes/donationCardRoutes.js";
import donationDetailRoutes from "./Routes/donationDetailRoutes.js";
// import paymentRoutes from "./Routes/paymentRoutes.js";
import adminRoutes from "./Routes/authRoutes.js";

// ─── Load env variables ───────────────────────
dotenv.config();

const app = express();

// ─── Connect Database ─────────────────────────
connectDB();

const PORT = process.env.PORT || 3000;

// ─── CORS ─────────────────────────────────────
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5500",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Routes ───────────────────────────────────
app.use("/api/blog-cards", blogCardRoutes);
app.use("/api/blog-details", blogDetailRoutes);
app.use("/api/project-cards", projectCardRoutes);
app.use("/api/project-details", projectDetailRoutes);
app.use("/api/service-cards", serviceCardRoutes);
app.use("/api/service-details", serviceDetailRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/donation-cards", donationCardRoutes);
app.use("/api/donation-details", donationDetailRoutes);
// app.use("/api/payments", paymentRoutes);
app.use("/api/admin", adminRoutes);

// ─── 404 Handler ──────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ─── Global Error Handler ─────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);

  if (err.name === "CastError") {
    return res.status(400).json({ success: false, message: "Invalid ID format" });
  }
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({ success: false, message: `${field} already exists` });
  }
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
  if (err.name === "TokenExpiredError") {
    return res.status(401).json({ success: false, message: "Token expired" });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});