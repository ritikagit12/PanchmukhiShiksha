const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    orderId: { type: String, required: true },
    paymentId: { type: String },
    status: { type: String, default: "pending" }, 
}, { timestamps: true });


module.exports = mongoose.model("Payment", PaymentSchema);
