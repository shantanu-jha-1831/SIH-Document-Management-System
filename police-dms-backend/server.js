require("dotenv").config();
const caseRoutes = require("./src/routes/caseRoutes");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");

const documentRoutes = require("./src/routes/documentRoutes");

const auditRoutes = require("./src/routes/auditRoutes");

const accessRequestRoutes = require("./src/routes/accessRequestRoutes");


dotenv.config();

const app = express();


// ===============================
// CONNECT DATABASE
// ===============================
connectDB();


// ===============================
// MIDDLEWARE
// ===============================
app.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:5173"
    })
);

app.use(express.json());


// ===============================
// AUTH ROUTES
// ===============================
app.use("/api/auth", authRoutes);


// ===============================
// ADMIN ROUTES
// ===============================
app.use("/api/admin", adminRoutes);


app.use("/api/cases", caseRoutes);


app.use("/api/documents", documentRoutes);


app.use("/api/audit-logs", auditRoutes);


app.use("/api/access-requests", accessRequestRoutes);


// ===============================
// TEST ROUTE
// ===============================
app.get("/", (req, res) => {

    res.json({
        success: true,
        message: "Police DMS Backend is running"
    });

});


// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log(
        `Server running on http://localhost:${PORT}`
    );

});