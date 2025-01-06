import jwt from 'jsonwebtoken'
import User from "../models/users.models.js";

import bcrypt from "bcrypt";

// GENERATE ACCESS AND REFRESH TOKEN

const generateAccessToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.ACCESS_JWT_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.REFRESH_JWT_SECRET, { expiresIn: "7d" });
};



// register user


const registerUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        const user = await User.findOne({ email });
        if (user) {
            return res.status(409).json({ message: "User already exists" }); // Use 409 for conflicts
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            data: newUser,
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// login user


const loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email) return res.status(400).json({ message: "Email is required" });
    if (!password) return res.status(400).json({ message: "Password is required" });

    try {
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: "No user found" });

        console.log("Hashed password in DB:", user.password);
        console.log("Entered password:", password);


        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.json({
            message: "User logged in successfully",
            accessToken,
            data: { id: user._id, email: user.email },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};