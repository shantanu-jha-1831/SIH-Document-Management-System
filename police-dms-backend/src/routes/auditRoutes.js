const express = require("express");

const {
    protect,
    adminOnly
} = require("../middleware/authMiddleware");

const {
    getAuditLogs
} = require("../controllers/auditController");

const router = express.Router();

router.use(protect);
router.use(adminOnly);

router.get("/", getAuditLogs);

module.exports = router;
