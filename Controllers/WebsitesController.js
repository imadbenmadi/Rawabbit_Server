const { Users, requests, Websites } = require("../models/Database");
const Verify_Admin = require("../Middleware/Verify_Admin");


const get_All_Websites = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("admin_accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }

    try {
        const users = await Websites.find({}); // Exclude the Notifications field
        return res.status(200).json(users);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
};

module.exports = {
    get_All_Websites,
};
