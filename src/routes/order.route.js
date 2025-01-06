import express from "express";
import { createOrder , getOrders , getOrderById } from "../controllers/order.controller.js";

const router = express.Router();

router.post("/createorder", createOrder);
router.get("/getorder", getOrders);
router.get("/:id", getOrderById);


export default router;

