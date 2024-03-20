const jwt = require("jsonwebtoken");
require("dotenv").config();
const { Users, Refresh_tokens } = require("../../models/Database");

const handleRefreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(409).json({ message: "Messing Data" });
        }
        const found_in_DB = await Refresh_tokens.findOne({
            token: refreshToken,
        }).exec();
        if (!found_in_DB)
            return res
                .status(403)
                .json({ message: "Refresh Token not found in the database" }); //Forbidden
        // evaluate jwt

        jwt.verify(
            refreshToken,
            process.env.REFRESH_TOKEN_SECRET,
            async (err, decoded) => {
                if (err || found_in_DB.userId != decoded.userId)
                    return res.status(403).json({
                        message:
                            " fail to virify Jwt , refresh token does not match ",
                    });
                const accessToken = jwt.sign(
                    { userId: decoded.userId },
                    process.env.ACCESS_TOKEN_SECRET,
                    { expiresIn: "10s" }
                );
                res.cookie("accessToken", accessToken, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true,
                    maxAge: 60 * 60 * 1000,
                });
                const user = await Users.findOne({ _id: decoded.userId });
                const UserData_To_Send = {
                    _id: user._id,
                    Email: user.Email,
                    FirstName: user.FirstName,
                    LastName: user.LastName,
                    Notifications: user.Notifications,
                    Courses: user.Courses,
                    Gender: user.Gender,
                    IsEmailVerified: user.IsEmailVerified,
                };
                return res.status(200).json({
                    message: "Access token refreshed Successully",
                    userData: UserData_To_Send,
                });
            }
        );
    } catch (err) {
        return res.status(500).json({ message: err });
    }
};
module.exports = { handleRefreshToken };
