const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Users, Refresh_tokens } = require("../../models/Database");

router.get("/", async (req, res) => {
    const secretKey = process.env.ADMIN_ACCESS_TOKEN_SECRET;
    const accessToken = req.cookies.admin_accessToken;
    const refreshToken = req.cookies.admin_refreshToken;

    try {
        // Verify the access token
        jwt.verify(accessToken, secretKey, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    // Access token expired, attempt to refresh it
                    try {
                        if (!refreshToken) {
                            return res.status(401).json({
                                message:
                                    "Unauthorized: Refresh token is missing",
                            });
                        }

                        const found_in_DB = await Refresh_tokens.findOne({
                            token: refreshToken,
                        }).exec();

                        if (!found_in_DB) {
                            return res.status(401).json({
                                message:
                                    "Unauthorized: Refresh token not found in the database",
                            });
                        }

                        jwt.verify(
                            refreshToken,
                            process.env.ADMIN_REFRESH_TOKEN_SECRET,
                            async (err, decoded) => {
                                if (err) {
                                    return res.status(401).json({
                                        message:
                                            "Unauthorized: Failed to verify JWT. Refresh token does not match",
                                    });
                                }

                                // Generate new access token
                                const newAccessToken = jwt.sign(
                                    { userId: decoded._id },
                                    process.env.ACCESS_TOKEN_SECRET,
                                    { expiresIn: "1h" }
                                );
                                res.cookie("accessToken", newAccessToken, {
                                    httpOnly: true,
                                    sameSite: "None",
                                    secure: true,
                                    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
                                });

                                return res.status(200).json({
                                    message:
                                        "Access token refreshed successfully",
                                });
                            }
                        );
                    } catch (refreshErr) {
                        return res.status(500).json({ message: refreshErr });
                    }
                } else {
                    // Other verification error, return unauthorized

                    return res.status(401).json({
                        message: "Unauthorized: Access token is invalid",
                    });
                }
            } else {
                return res.status(200).json({
                    message: "Access token is valid",
                });
            }
        });
    } catch (err) {
        return res.status(500).json({ message: err });
    }
});

module.exports = router;
