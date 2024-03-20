const express = require("express");
const router = express.Router();
const Send_Verification_EmailController = require("../../Controllers/Auth/Send_Verification_EmailController");
// route handler
// Object to track attempts and block expiration time for each IP address
const Attempts = {};

// Function to block an IP address for a specified duration (in milliseconds)
const blockIP = (ipAddress, duration) => {
    Attempts[ipAddress] = {
        attempts: 1,
        expirationTime: Date.now() + duration,
    };
};

// Middleware to cleanup expired IP address blocks
const cleanupExpiredBlocks = () => {
    const currentTime = Date.now();
    Object.keys(Attempts).forEach((ipAddress) => {
        if (Attempts[ipAddress].expirationTime < currentTime) {
            delete Attempts[ipAddress];
        }
    });
};

// Cleanup expired IP address blocks every minute
setInterval(cleanupExpiredBlocks, 60000); // Run every minute

router.post("/", async (req, res) => {
    const ipAddress = req.ip;

    // Check if the IP address is already blocked and the block has expired
    if (
        Attempts[ipAddress] &&
        Attempts[ipAddress].expirationTime < Date.now()
    ) {
        delete Attempts[ipAddress]; // Unblock the IP address
    }
    // If is successful, increment attempts and check threshold
    if (Attempts[ipAddress]) {
        if (Attempts[ipAddress].attempts >= 5) {
            return res
                .status(429)
                .json({ message: "Too many login attempts. Try again later." });
        }
    }
    Attempts[ipAddress] = Attempts[ipAddress] || {
        attempts: 0,
    };

    Attempts[ipAddress].attempts++;

    // Check if attempts threshold is exceeded
    if (Attempts[ipAddress].attempts >= 5) {
        blockIP(ipAddress, 300000); // Block IP address for 5 minutes (300,000 milliseconds)
        return res.status(429).json({
            message: "Too many attempts. Try again later.",
        });
    }

    // Call the Send_Verification_EmailController to handle the process
    Send_Verification_EmailController.handle_send_Email(req, res);

    // Return the result of the attempt
});

module.exports = router;
