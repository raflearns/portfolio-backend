const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db'); // Connects to your Aiven DB

const router = express.Router();

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Hash the password for security
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        
        // Generate a unique ID
        const id = require('crypto').randomUUID();
        
        // Save to database
        await pool.query(
            'INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)', 
            [id, email, hashedPassword]
        );
        
        res.status(201).json({ message: 'Admin user registered successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Find user by email
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        const user = users[0];
        
        // Check if passwords match
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        
        // Create and send JWT Token
        const token = jwt.sign(
            { id: user.id, role: user.role }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );
        
        res.json({ 
            token, 
            user: { id: user.id, email: user.email, role: user.role } 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error during login' });
    }
});

module.exports = router;