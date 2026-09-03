const express = require("express");

const {
    registerOfficer,
    loginOfficer
} = require("../controllers/authController");

const router = express.Router();


// Officer registration
router.post("/register", registerOfficer);


// Officer login
router.post("/login", loginOfficer);


module.exports = router;
