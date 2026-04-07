const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { otpValidation, verifyOtpValidation } = require('../middleware/validation');

const router = express.Router();

// In-memory storage for OTP (in production, use Redis or database)
const otpStore = new Map();

// Generate a random 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};



router.post('/login', async (req, res) => {
    const { username, phone } = req.body;

    if (!username || !phone) {
        return res.status(400).json({ message: 'Username and phone are required' });
    }

    try {
        // --- ✅ FIX: Added .populate('profile') to include student/warden details ---
        const user = await User.findOne({ username, phone }).populate('profile');
        
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );

        // Return the token and the fully populated user object
        return res.json({ token, user });
    } catch (err) {
        console.error("Login Error:", err);
        return res.status(500).json({ message: 'Server error' });
    }
});

// Logout endpoint (client-side token removal)
router.post('/logout', (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
