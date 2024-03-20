const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Users, Refresh_tokens } = require("../../models/Database");

router.get("/", async (req, res) => {
    const secretKey = process.env.ACCESS_TOKEN_SECRET;
    const accessToken = req.cookies.accessToken;
    const refreshToken = req.cookies.refreshToken;
    if (req.cookies.admin_accessToken) {
        res.clearCookie("admin_accessToken");
    }
    if (req.cookies.admin_refreshToken) {
        res.clearCookie("admin_refreshToken");
    }
    try {
        // Verify the access token
        jwt.verify(accessToken, secretKey, async (err, decoded) => {
            if (err) {
                if (err.name === "TokenExpiredError") {
                    // Access token expired, attempt to refresh it
                    try {
                        if (!refreshToken) {
                            if (req.cookies.accessToken) {
                                res.clearCookie("accessToken");
                            }
                            if (req.cookies.refreshToken) {
                                res.clearCookie("refreshToken");
                            }
                            return res.status(401).json({
                                message:
                                    "Unauthorized: Refresh token is missing",
                            });
                        }

                        const found_in_DB = await Refresh_tokens.findOne({
                            token: refreshToken,
                        }).exec();

                        if (!found_in_DB) {
                            if (req.cookies.accessToken) {
                                res.clearCookie("accessToken");
                            }
                            if (req.cookies.refreshToken) {
                                res.clearCookie("refreshToken");
                            }
                            return res.status(401).json({
                                message: "Unauthorized",
                            });
                        }

                        jwt.verify(
                            refreshToken,
                            process.env.REFRESH_TOKEN_SECRET,
                            async (err, decoded) => {
                                if (err) {
                                    if (req.cookies.accessToken) {
                                        res.clearCookie("accessToken");
                                    }
                                    if (req.cookies.refreshToken) {
                                        res.clearCookie("refreshToken");
                                    }
                                    return res.status(401).json({
                                        message: "Unauthorized",
                                    });
                                } else if (
                                    found_in_DB.userId != decoded.userId
                                ) {
                                    if (req.cookies.accessToken) {
                                        res.clearCookie("accessToken");
                                    }
                                    if (req.cookies.refreshToken) {
                                        res.clearCookie("refreshToken");
                                    }
                                    return res.status(401).json({
                                        message: "Unauthorized",
                                    });
                                }

                                // Generate new access token
                                const newAccessToken = jwt.sign(
                                    { userId: decoded.userId },
                                    process.env.ACCESS_TOKEN_SECRET,
                                    { expiresIn: "1h" }
                                );
                                res.cookie("accessToken", newAccessToken, {
                                    httpOnly: true,
                                    sameSite: "None",
                                    secure: true,
                                    maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
                                });
                                const user = await Users.findOne({
                                    _id: decoded.userId,
                                });
                                const UserData_To_Send = {
                                    _id: user._id,
                                    Email: user.Email,
                                    FirstName: user.FirstName,
                                    LastName: user.LastName,
                                    Notifications: user.Notifications,
                                    Courses: user.Courses,
                                    Services: user.Services,
                                    Gender: user.Gender,
                                    IsEmailVerified: user.IsEmailVerified,
                                    
                                };
                                return res.status(200).json({
                                    message:
                                        "Access token refreshed successfully",
                                    userData: UserData_To_Send,
                                });
                            }
                        );
                    } catch (refreshErr) {
                        if (req.cookies.accessToken) {
                            res.clearCookie("accessToken");
                        }
                        if (req.cookies.refreshToken) {
                            res.clearCookie("refreshToken");
                        }
                        return res.status(500).json({ message: refreshErr });
                    }
                } else {
                    if (req.cookies.accessToken) {
                        res.clearCookie("accessToken");
                    }
                    if (req.cookies.refreshToken) {
                        res.clearCookie("refreshToken");
                    }
                    return res.status(401).json({
                        message: "Unauthorized: Access token is invalid",
                    });
                }
            } else {
                const user = await Users.findOne({ _id: decoded.userId });
                const UserData_To_Send = {
                    _id: user ? (user._id ? user._id : null) : null,
                    Email: user ? (user.Email ? user.Email : null) : null,
                    FirstName: user
                        ? user.FirstName
                            ? user.FirstName
                            : null
                        : null,
                    LastName: user
                        ? user.LastName
                            ? user.LastName
                            : null
                        : null,
                    Notifications: user
                        ? user.Notifications
                            ? user.Notifications
                            : null
                        : null,
                    Courses: user ? (user.Courses ? user.Courses : null) : null,
                    Services: user
                        ? user.Services
                            ? user.Services
                            : null
                        : null,
                    Gender: user ? (user.Gender ? user.Gender : null) : null,
                    IsEmailVerified: user
                        ? user.IsEmailVerified
                            ? user.IsEmailVerified
                            : null
                        : null,
                };
                return res.status(200).json({
                    message: "Access token is valid",
                    userData: UserData_To_Send,
                });
            }
        });
    } catch (err) {
        if (req.cookies.accessToken) {
            res.clearCookie("accessToken");
        }
        if (req.cookies.refreshToken) {
            res.clearCookie("refreshToken");
        }
        return res.status(500).json({ message: err });
    }
});

module.exports = router;
