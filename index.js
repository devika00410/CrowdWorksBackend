import express from "express";
import blogCardRoutes from "./Routes/blogCardRoutes.js";
import blogDetailRoutes from "./Routes/blogDetailRoutes.js";
import projectCardRoutes from "./Routes/projectCardRoutes.js";
import projectDetailRoutes from "./Routes/projectDetailRoutes.js";
import serviceCardRoutes from "./Routes/serviceCardRoutes.js";
import serviceDetailRoutes from "./Routes/serviceDetailRoutes.js";
import contactRoutes from "./Routes/contactRoute.js";
import donationCardRoutes from "./Routes/donationCardRoutes.js";

const app = express();

const PORT = process.env.PORT || 3000;


app.use(express.json());

app.use("/api/blog-cards", blogCardRoutes);
app.use("/api/blog-details", blogDetailRoutes);
app.use("/api/project-cards", projectCardRoutes);
app.use("/api/project-details", projectDetailRoutes);
app.use("/api/service-cards", serviceCardRoutes);
app.use("/api/service-details", serviceDetailRoutes);
app.use("/api/contacts", contactRoutes);
app.use("/api/donation-cards", donationCardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});