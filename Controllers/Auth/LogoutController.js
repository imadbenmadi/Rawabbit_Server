require("dotenv").config();
const { Refresh_tokens } = require("../../models/Database");
const handleLogout = async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    const accessToken = req.cookies.accessToken;
    if (!refreshToken && !accessToken) {
        return res.status(204).json({ message: "No cookie found" });
    }

    if (refreshToken) {
        try {
            await Refresh_tokens.deleteOne({ token: refreshToken });
        } catch (error) {
            return res.status(500).json({ message : error });
        }
    }
    res.clearCookie("refreshToken", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    res.clearCookie("accessToken", {
        httpOnly: true,
        sameSite: "None",
        secure: true,
    });
    return res.status(204).json({ message: "Logged out successfully" });
};

module.exports = { handleLogout };
