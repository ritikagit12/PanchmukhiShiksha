const express = require("express");
const Razorpay = require("razorpay");
const Payment = require("../models/payment");
require("dotenv").config();

const router = express.Router();

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
});

// Create Razorpay Order
router.post("/create-order", async (req, res) => {
    const { name, email, amount } = req.body;

    const options = {
        amount: amount * 100,
        currency: "INR",
        payment_capture: 1, 
    };

    try {
        const order = await razorpay.orders.create(options);

        // Save order details in MongoDB
        const newPayment = new Payment({
            name,
            email,
            amount,
            orderId: order.id,
            status: "pending",
        });
        await newPayment.save();

        res.json(order);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Verify Payment
router.post("/verify-payment", async (req, res) => {
    const { order_id, payment_id } = req.body;

    try {
        const payment = await Payment.findOne({ orderId: order_id });

        if (!payment) {
            return res.status(404).json({ message: "Payment not found" });
        }

        payment.paymentId = payment_id;
        payment.status = "success";
        await payment.save();

        res.json({ message: "Payment successful", payment });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
