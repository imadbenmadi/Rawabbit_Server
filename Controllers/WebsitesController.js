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
        const websites = await Websites.find({}); // Exclude the Notifications field
        return res.status(200).json(websites);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
};
const getWebsite = async (req, res) => {
    const WebsiteId = req.params.WebsiteId;
    if (!WebsiteId) return res.status(409).json({ error: "Missing Data" });

    try {
        const Website = await Websites.findById(WebsiteId)
            .populate({
                path: "User",
                select: "-Notifications -Requests -Telephone -Password -Age -IsEmailVerified", // Exclude notifications and requests
            })
            .populate({
                path: "Comments",
                populate: {
                    path: "User",
                    select: "-Notifications -Requests -Telephone -Password -Age -IsEmailVerified ", // Exclude notifications and requests
                },
            })
            .populate({
                path: "Ratings",
                populate: {
                    path: "User",
                    select: "-Notifications -Requests -Telephone -Password -Age -IsEmailVerified", // Exclude notifications and requests
                },
            });

        if (!Website) {
            return res.status(404).json({ error: "Website not found." });
        }

        return res.status(200).json(Website);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error.message });
    }
};
const getWebsiteByCategory = async (req, res) => {
    const category = req.params.category;
    if (!category) return res.status(409).json({ error: "Messing Data" });

    try {
        const websites = await Websites.find({ Category: category });
        return res.status(200).json(websites);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: error });
    }
};
const searchWebsite = async (req, res) => {
    try {
        const { search } = req.params;
        if (!search)
            return res.status(409).json({ error: "Messing search query" });
        // Construct a query object to search for title, category, and link
        const query = {
            $or: [
                { title: { $regex: search, $options: "i" } }, // Case-insensitive search for title
                { category: { $regex: search, $options: "i" } }, // Case-insensitive search for category
                { link: { $regex: search, $options: "i" } }, // Case-insensitive search for link
            ],
        };

        // Perform the search using the constructed query
        const results = await Websites.find(query);

        return res.status(200).json({ results });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
module.exports = {
    get_All_Websites,
    getWebsite,

    getWebsiteByCategory,
    searchWebsite,
};
