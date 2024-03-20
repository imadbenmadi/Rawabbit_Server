const express = require("express");
const router = express.Router();
const LoginController = require("../../Controllers/Auth/LoginController");

// Object to track login attempts and block expiration time for each IP address
const loginAttempts = {};

// Function to block an IP address for a specified duration (in milliseconds)
const blockIP = (ipAddress, duration) => {
    loginAttempts[ipAddress] = {
        attempts: 1,
        expirationTime: Date.now() + duration,
    };
};

// Middleware to cleanup expired IP address blocks
const cleanupExpiredBlocks = () => {
    const currentTime = Date.now();
    Object.keys(loginAttempts).forEach((ipAddress) => {
        if (loginAttempts[ipAddress].expirationTime < currentTime) {
            delete loginAttempts[ipAddress];
        }
    });
};

// Cleanup expired IP address blocks every minute
setInterval(cleanupExpiredBlocks, 60000); // Run every minute

// Login route handler
router.post("/", (req, res) => {
    const ipAddress = req.ip;

    // Check if the IP address is blocked and the block has expired
    if (
        loginAttempts[ipAddress] &&
        loginAttempts[ipAddress].expirationTime < Date.now()
    ) {
        delete loginAttempts[ipAddress]; // Unblock the IP address
    }

    // Check if the IP address is already blocked
    if (loginAttempts[ipAddress]) {
        // Check if login attempts threshold is exceeded
        if (loginAttempts[ipAddress].attempts >= 5) {
            return res
                .status(429)
                .json({ message: "Too many login attempts. Try again later." });
        }
    }

    // Increment login attempts or set initial attempt if not present
    loginAttempts[ipAddress] = loginAttempts[ipAddress] || { attempts: 0 };
    loginAttempts[ipAddress].attempts++;

    // Check if login attempts threshold is exceeded after incrementing
    if (loginAttempts[ipAddress].attempts >= 5) {
        blockIP(ipAddress, 60000); // Block IP address for 1 minute (60000 milliseconds)
        return res
            .status(429)
            .json({ message: "Too many login attempts. Try again later." });
    }

    // Handle login
    LoginController.handleLogin(req, res);
});

module.exports = router;
