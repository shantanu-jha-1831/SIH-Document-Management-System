const mongoose = require("mongoose");
const dotenv = require("dotenv");
const bcrypt = require("bcryptjs");

const User = require("./src/models/User");

dotenv.config();

const createAdmin = async () => {
    try {

        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URI);

        console.log("MongoDB connected");


        // Check whether admin already exists
        const existingAdmin = await User.findOne({
            role: "ADMIN"
        });

        if (existingAdmin) {

            console.log("Admin account already exists");

            await mongoose.connection.close();

            return;
        }


        // Admin password
        const password = "Admin@12345";


        // Hash password
        const hashedPassword = await bcrypt.hash(
            password,
            12
        );


        // Create admin
        const admin = await User.create({

            fullName: "System Administrator",

            policeNumber: "ADMIN-001",

            rank: "Administrator",

            department: "Administration",

            email: "admin@policedms.com",

            mobile: "9999999999",

            password: hashedPassword,

            role: "ADMIN",

            status: "ACTIVE"

        });


        console.log("=================================");
        console.log("ADMIN CREATED SUCCESSFULLY");
        console.log("=================================");
        console.log("Police Number:", admin.policeNumber);
        console.log("Password:", password);
        console.log("Role:", admin.role);
        console.log("Status:", admin.status);
        console.log("=================================");


        await mongoose.connection.close();

    } catch (error) {

        console.error("Error creating admin:", error.message);

        await mongoose.connection.close();

    }
};


createAdmin();