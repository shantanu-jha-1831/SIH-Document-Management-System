const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// ===============================
// REGISTER OFFICER
// ===============================
const registerOfficer = async (req, res) => {
    try {
        const {
            fullName,
            policeNumber,
            rank,
            department,
            email,
            mobile,
            password
        } = req.body;

        // Check required fields
        if (
            !fullName ||
            !policeNumber ||
            !rank ||
            !department ||
            !email ||
            !mobile ||
            !password
        ) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            });
        }

        // Check if police number already exists
        const existingPoliceNumber = await User.findOne({
            policeNumber: policeNumber.toUpperCase()
        });

        if (existingPoliceNumber) {
            return res.status(400).json({
                success: false,
                message: "Police registration number already exists"
            });
        }

        // Check if email already exists
        const existingEmail = await User.findOne({
            email: email.toLowerCase()
        });

        if (existingEmail) {
            return res.status(400).json({
                success: false,
                message: "Email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create officer
        const officer = await User.create({
            fullName,
            policeNumber: policeNumber.toUpperCase(),
            rank,
            department,
            email: email.toLowerCase(),
            mobile,
            password: hashedPassword,
            role: "OFFICER",
            status: "PENDING"
        });

        // Send response
        res.status(201).json({
            success: true,
            message:
                "Registration submitted successfully. Wait for administrator approval.",
            user: {
                id: officer._id,
                fullName: officer.fullName,
                policeNumber: officer.policeNumber,
                status: officer.status
            }
        });

    } catch (error) {

        console.error("Registration error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during registration"
        });
    }
};


// ===============================
// LOGIN OFFICER
// ===============================
const loginOfficer = async (req, res) => {
    try {

        const {
            policeNumber,
            password
        } = req.body;


        // Check required fields
        if (!policeNumber || !password) {
            return res.status(400).json({
                success: false,
                message: "Police number and password are required"
            });
        }


        // Find user
        const user = await User.findOne({
            policeNumber: policeNumber.toUpperCase()
        });


        // User not found
        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Invalid police number or password"
            });
        }


        // Check password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );


        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid police number or password"
            });
        }


        // Check account status
        if (user.status !== "ACTIVE") {

            return res.status(403).json({
                success: false,
                message:
                    "Your account is pending administrator approval"
            });
        }


        // Create JWT token
        const token = jwt.sign(
            {
                id: user._id,
                role: user.role,
                policeNumber: user.policeNumber
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );


        // Send response
        res.status(200).json({
            success: true,
            message: "Login successful",

            token,

            user: {
                id: user._id,
                fullName: user.fullName,
                policeNumber: user.policeNumber,
                rank: user.rank,
                department: user.department,
                email: user.email,
                role: user.role,
                status: user.status
            }
        });

    } catch (error) {

        console.error("Login error:", error);

        res.status(500).json({
            success: false,
            message: "Server error during login"
        });
    }
};


// ===============================
// EXPORT CONTROLLERS
// ===============================
module.exports = {
    registerOfficer,
    loginOfficer
};
