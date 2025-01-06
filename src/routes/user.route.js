import express from "express";
import { loginUser, registerUser } from "../controllers/user.controller.js";


const router = express.Router();

// REGISTER USER

router.post("/register" , registerUser);
router.post("/login" , loginUser);


export default router;