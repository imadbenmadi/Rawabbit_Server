require("dotenv").config();
const jwt = require("jsonwebtoken");
const { Refresh_tokens } = require("../models/Database");

const Verify_Admin = async (req, res) => {
    const secretKey = process.env.ADMIN_ACCESS_TOKEN_SECRET;
    const accessToken = req.cookies.admin_accessToken;
    const refreshToken = req.cookies.admin_refreshToken;
    try {
        const decoded = jwt.verify(accessToken, secretKey);
        return { status: true, Refresh: false };
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            // Token expired, attempt to refresh it
            try {
                if (!refreshToken) {
                    return { status: false, Refresh: false };
                }

                const found_in_DB = await Refresh_tokens.findOne({
                    token: refreshToken,
                }).exec();

                if (!found_in_DB) {
                    return { status: false, Refresh: false };
                }

                return new Promise((resolve, reject) => {
                    jwt.verify(
                        refreshToken,
                        process.env.ADMIN_REFRESH_TOKEN_SECRET,
                        async (err, decoded) => {
                            if (err) {
                                resolve({ status: false, Refresh: false });
                            } else {
                                // Generate new access token
                                const newAccessToken = jwt.sign(
                                    { userId: decoded.userId },
                                    process.env.ADMIN_ACCESS_TOKEN_SECRET,
                                    { expiresIn: "5m" }
                                );

                                resolve({
                                    status: true,
                                    Refresh: true,
                                    newAccessToken,
                                });
                            }
                        }
                    );
                });
            } catch (refreshErr) {
                return { status: false, Refresh: false };
            }
        } else {
            return { status: false, Refresh: false };
        }
    }
};

module.exports = Verify_Admin;
