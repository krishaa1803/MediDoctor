const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const User = require('./models/User'); // Ensure this points to your User model
const Appointment = require('./models/Appointment');
const Order = require('./models/Order'); 
const path = require('path');

const app = express();
const port = 3001;

// Middleware
app.use(cors({
    origin: 'http://localhost:3000', // Replace with the address where your frontend is running
    credentials: true
}));
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('.'));
app.use(express.static(path.join(__dirname, 'MediDoctor_frontend')));
// Route to indexuser.html
app.get('/indexuser.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'MediDoctor_frontend', 'indexuser.html'));
});
// MongoDB connection
mongoose.connect('mongodb://localhost:27017/medidoctor', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.log('MongoDB connection error:', err));

// Setup Nodemailer
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'krishagarg18@gmail.com', // Replace with your email
        pass: 'lxjd xrac grnu ypkd'    // Replace with your email password (or app password if 2FA is enabled)
    }
});

// POST route for signup
app.post('/signup', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).send('All fields are required!');
    }

    if (password.length < 6) {
        return res.status(400).send('Password must be at least 6 characters!');
    }

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).send('Email is already registered!');
        }

        const newUser = new User({
            name,
            email,
            password  // Save password as plain text
        });

        await newUser.save();
        res.status(201).send('Sign up successful!');
    } catch (error) {
        console.error('Error saving user:', error);
        res.status(500).send('Something went wrong. Please try again later.');
    }
});

// POST route for login
app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    try {
        const user = await User.findOne({ email });
        if (!user || user.password !== password) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        res.status(200).json({ name: user.name, message: 'Login successful!' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Something went wrong, please try again later' });
    }
});

// POST route for booking an appointment
app.post('/book-appointment', async (req, res) => {
    const { date, time, patientEmail } = req.body;

    try {
        const existingAppointment = await Appointment.findOne({ date, time, patientEmail });
        if (existingAppointment) {
            return res.status(400).json({ success: false, message: 'You already have an appointment at this time.' });
        }

        const appointment = new Appointment({
            date,
            time,
            patientEmail
        });

        await appointment.save();

        const mailOptions = {
            from: 'krishagarg18@gmail.com',
            to: patientEmail,
            subject: 'Appointment Confirmation with Dr. Murthy',
            text: `Your appointment with Dr. Murthy is scheduled for ${date} at ${time}.`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log(error);
                return res.status(500).json({ success: false, message: 'Failed to send confirmation email.' });
            }
            console.log('Email sent: ' + info.response);
            return res.status(200).json({ success: true, message: 'Appointment booked and confirmation email sent.' });
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: 'Failed to book the appointment. Please try again.' });
    }
});
// Route to save an order
app.post('/save-order', async (req, res) => {
    try {
        const order = new Order(req.body);
        await order.save();
        res.status(201).json({ success: true, message: 'Order saved successfully!' });
    } catch (error) {
        console.error('Error saving order:', error);
        res.status(500).json({ success: false, message: 'Failed to save order. Please try again.' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
