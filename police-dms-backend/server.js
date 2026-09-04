require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./src/config/db");

const authRoutes = require("./src/routes/authRoutes");
const adminRoutes = require("./src/routes/adminRoutes");
const caseRoutes = require("./src/routes/caseRoutes");
const documentRoutes = require("./src/routes/documentRoutes");
const auditRoutes = require("./src/routes/auditRoutes");
const accessRequestRoutes = require("./src/routes/accessRequestRoutes");

const app = express();

// ===============================
// CONNECT DATABASE
// ===============================
connectDB();

// ===============================
// CORS
// ===============================

const allowedOrigins = [
    "http://localhost:5173",
    "https://sih-document-management-system-delta.vercel.app"
];

app.use(
    cors({
        origin: function (origin, callback) {

            // Allow requests such as Postman/server-to-server
            if (!origin) {
                return callback(null, true);
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true);
            }

            console.log("Blocked by CORS:", origin);

            return callback(new Error("Not allowed by CORS"));
        },

        methods: [
            "GET",
            "POST",
            "PUT",
            "DELETE",
            "PATCH",
            "OPTIONS"
        ],

        allowedHeaders: [
            "Content-Type",
            "Authorization"
        ],

        credentials: true
    })
);

// ===============================
// BODY PARSER
// ===============================
app.use(express.json());

// ===============================
// AUTH ROUTES
// ===============================
app.use("/api/auth", authRoutes);

// ===============================
// ADMIN ROUTES
// ===============================
app.use("/api/admin", adminRoutes);

// ===============================
// CASE ROUTES
// ===============================
app.use("/api/cases", caseRoutes);

// ===============================
// DOCUMENT ROUTES
// ===============================
app.use("/api/documents", documentRoutes);

// ===============================
// AUDIT LOG ROUTES
// ===============================
app.use("/api/audit-logs", auditRoutes);

// ===============================
// ACCESS REQUEST ROUTES
// ===============================
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
// ERROR HANDLER
// ===============================
app.use((err, req, res, next) => {

    console.error("Server Error:", err.message);

    if (err.message === "Not allowed by CORS") {
        return res.status(403).json({
            success: false,
            message: "CORS policy blocked this request"
        });
    }

    res.status(500).json({
        success: false,
        message: "Internal server error"
    });
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});