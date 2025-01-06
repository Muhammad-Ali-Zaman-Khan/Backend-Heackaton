import mongoose from "mongoose";
import Order from "../models/order.model.js";
import Product from "../models/product.model.js";


// CREATE ORDER

const createOrder = async (req, res) => {
    const { products } = req.body;
    const userId = req.user._id;

    if (!products || products.length === 0) {
        return res.status(400).json({ message: "Products are required to place an order" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    const invalidProductIds = products.filter(productId => !mongoose.Types.ObjectId.isValid(productId));
    if (invalidProductIds.length > 0) {
        return res.status(400).json({ message: "Invalid product IDs", invalidProductIds });
    }

    try {
        const productDetails = await Product.find({ _id: { $in: products } });

        if (productDetails.length !== products.length) {
            return res.status(400).json({ message: "One or more products are invalid" });
        }

        const totalPrice = productDetails.reduce((total, product) => total + product.price, 0);

        const order = await Order.create({
            user: userId,
            products,
            totalPrice,
        });

        res.status(201).json({
            message: "Order placed successfully",
            data: order,
        });
    } catch (error) {
        console.error("Error creating order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GET ORDER

const getOrders = async (req, res) => {
    const userId = req.user._id; 
    try {
        const orders = await Order.find({ user: userId }).populate("products", "name price");

        res.status(200).json({
            message: "Orders fetched successfully",
            data: orders,
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

// GER ORDER BY ID

const getOrderById = async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        return res.status(400).json({ message: "Invalid order ID" });
    }

    try {
        const order = await Order.findById(id)
            .populate("products", "name price")
            .populate("user", "username email");

        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.status(200).json({
            message: "Order fetched successfully",
            data: order,
        });
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export {createOrder , getOrders , getOrderById }