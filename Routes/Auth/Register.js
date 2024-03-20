const express = require("express");
const router = express.Router();
const RegisterController = require("../../Controllers/Auth/RegisterController");
// Registration route handler
// Object to track registration attempts and block expiration time for each IP address
const registrationAttempts = {};

// Function to block an IP address for a specified duration (in milliseconds)
const blockIP = (ipAddress, duration) => {
    registrationAttempts[ipAddress] = {
        attempts: 1,
        expirationTime: Date.now() + duration,
    };
};

// Middleware to cleanup expired IP address blocks
const cleanupExpiredBlocks = () => {
    const currentTime = Date.now();
    Object.keys(registrationAttempts).forEach((ipAddress) => {
        if (registrationAttempts[ipAddress].expirationTime < currentTime) {
            delete registrationAttempts[ipAddress];
        }
    });
};

// Cleanup expired IP address blocks every minute
setInterval(cleanupExpiredBlocks, 60000); // Run every minute

router.post("/", async (req, res) => {
    const ipAddress = req.ip;

    // Check if the IP address is already blocked and the block has expired
    if (
        registrationAttempts[ipAddress] &&
        registrationAttempts[ipAddress].expirationTime < Date.now()
    ) {
        delete registrationAttempts[ipAddress]; // Unblock the IP address
    }
    // If registration is successful, increment registration attempts and check threshold
    if (registrationAttempts[ipAddress]) {
        if (registrationAttempts[ipAddress].attempts >= 5) {
            return res
                .status(429)
                .json({ message: "Too many login attempts. Try again later." });
        }
    }
    registrationAttempts[ipAddress] = registrationAttempts[ipAddress] || {
        attempts: 0,
    };

    registrationAttempts[ipAddress].attempts++;

    // Check if registration attempts threshold is exceeded
    if (registrationAttempts[ipAddress].attempts > 5) {
        blockIP(ipAddress, 300000); // Block IP address for 5 minutes (300,000 milliseconds)
        return res.status(429).json({
            message: "Too many registration attempts. Try again later.",
        });
    }

    // Call the RegisterController to handle the registration process
    RegisterController.handleRegister(req, res);

    // Return the result of the registration attempt
});

module.exports = router;
