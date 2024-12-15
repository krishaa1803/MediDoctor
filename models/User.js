// models/User.js
const mongoose = require('mongoose');

// Define the user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
}, { timestamps: true });  // Adds createdAt and updatedAt fields automatically

// Create the User model from the schema and export it
const User = mongoose.model('User', userSchema);

module.exports = User;
