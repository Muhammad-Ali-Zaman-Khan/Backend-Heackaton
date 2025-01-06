import jwt from 'jsonwebtoken'
import User from "../models/user.model.js";
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
    const { username, email, password } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }
    if (!email) {
        return res.status(400).json({ message: "Email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" }); // Conflict
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            username,
            email,
            password: hashedPassword,
        });

        return res.status(201).json({
            message: "User registered successfully",
            data: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email,
            },
        });
    } catch (error) {
        console.error("Error registering user:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


// login user


const loginUser = async (req, res) => {
    const { username, email, password } = req.body;

    if (!username && !email) {
        return res
            .status(400)
            .json({ message: "Either username or email is required" });
    }
    if (!password) {
        return res.status(400).json({ message: "Password is required" });
    }

    try {
        const user = await User.findOne({
            $or: [{ email }, { username }],
        });

        if (!user) {
            return res.status(404).json({ message: "No user found" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid password" }); // Unauthorized
        }

        const accessToken = generateAccessToken(user._id);
        const refreshToken = generateRefreshToken(user._id);

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000, 
        });

        res.json({
            message: "User logged in successfully",
            accessToken,
            data: {
                id: user._id,
                username: user.username,
                email: user.email,
            },
        });
    } catch (error) {
        console.error("Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};




export {registerUser , loginUser };