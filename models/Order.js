// models/Order.js
const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    items: [
        {
            title: String,
            quantity: Number,
            price: Number
        }
    ],
    total: String,
    name: String,
    address: String,
    city: String,
    postalCode: String,
    paymentMethod: String,
    deliveryDate: String,
    orderDate: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Order', orderSchema);
