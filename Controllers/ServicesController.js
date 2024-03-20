const mongoose = require("mongoose");
const { Services, Users, request_Service } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/verify_user");
const getAllServices = async (req, res) => {
    try {
        // const page = parseInt(req.query.page) || 1;
        // let limit = parseInt(req.query.limit) || 20;
        // const totalCount = await Services.countDocuments();
        // const totalPages = Math.ceil(totalCount / limit);
        // const skip = (page - 1) * limit;
        // const services = await Services.find().skip(skip).limit(limit);
        const services = (await Services.find()).reverse();
        // return res.status(200).json({ totalPages, services });
        return res.status(200).json({ services });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_Service_ById = async (req, res) => {
    const ServiceId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(ServiceId)) {
        return res.status(409).json({ message: "Messing Data" });
    }

    try {
        const Service = await Services.findById(ServiceId);

        if (!Service) {
            return res.status(404).json({ message: "Service not found." });
        }

        return res.status(200).json(Service);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_Services_By_user_Id = async (req, res) => {
    const userId = req.params._id;
    if (!userId) return res.status(409).json({ message: "Missing Data" });

    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ message: "Unauthorized: Invalid token" });

    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 1 hour in milliseconds
        });
    }

    try {
        const user_in_db = await Users.findById(userId).populate("Services");
        if (!user_in_db) {
            return res.status(404).json({ message: "User not found." });
        }

        // const page = parseInt(req.query.page) || 1;
        // const limit = parseInt(req.query.limit) || 20;
        // const totalCount = user_in_db.Services.length;
        // const totalPages = Math.ceil(totalCount / limit);
        // const startIndex = (page - 1) * limit;
        // const endIndex = page * limit;

        // const services = user_in_db.Services.slice(startIndex, endIndex);
        const services = user_in_db.Services;

        return res.status(200).json({
            // totalPages,
            services,
        });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const handle_request_Service = async (req, res) => {
    const { ServiceId, userId } = req.body;
    if (!ServiceId || !userId) {
        return res.status(409).json({ message: "Messing Data." });
    }
    const isAuth = await Verify_user(req, res);
    if (isAuth.status == false)
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const user = await Users.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const existingRequest = await request_Service.findOne({
            User: userId,
            Service: ServiceId,
        });

        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "You have already Requested this Service" });
        }
        const Service = await Services.findById(ServiceId);
        if (!Service) {
            return res.status(404).json({ message: "Service not found." });
        }
        const new_request_Service = new request_Service({
            User: userId,
            Service: ServiceId,
        });
        await new_request_Service.save();
        return res
            .status(200)
            .json({ message: "Service requested successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
module.exports = {
    getAllServices,
    get_Services_By_user_Id,
    get_Service_ById,
    handle_request_Service,
};
