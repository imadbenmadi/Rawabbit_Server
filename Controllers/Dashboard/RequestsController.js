const { requests, Users, Websites } = require("../../models/Database");
const Verify_Admin = require("../../Middleware/Verify_Admin");

const handle_get_Requests = async (req, res) => {
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
        const requests = await requests.find().populate({
            path: "User",
            select: "FirstName LastName Email Telephone IsEmailVerified ", // Specify the fields you want to include
        });
        // .populate("Website");
        return res.status(200).json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_Accept_request = async (req, res) => {
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
        const { UserId, RequestId } = req.body;

        if (!UserId || !RequestId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }
        const request_in_db = await requests.findOne({
            User: UserId,
            Request: RequestId,
        });
        if (!request_in_db) {
            return res.status(409).json({ message: "Request not found." });
        }
        const newWebsite = new Websites({
            User: UserId,
            Link: request_in_db.Link,
            Title: request_in_db.Title,
            Text: request_in_db.Text,
            Description: request_in_db.Description,
            Category: request_in_db.Category,
            Message: request_in_db.Message,
        });
        await newWebsite.save();
        const Notification_ToSend = {
            Type: "Request",
            Title: "Request accepted",
            Text: "Your request has been accepted",
            Date: new Date(),
        };
        await Users.findByIdAndUpdate(UserId, {
            $push: {
                Websites: newWebsite._id, 
                Notifications: Notification_ToSend,
            },
        }).exec();
        await requests.deleteMany({ User: UserId, Request: RequestId });

        return res.status(200).json({ message: "Request accepted." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = handle_Accept_request;
const handle_Reject_request = async (req, res) => {
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
        const { UserId, RequestId } = req.body;

        if (!UserId || !RequestId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }

        // Remove the request from the database
        await requests.deleteMany({ User: UserId, Request: RequestId });
        const Notificatio_ToSend = {
            Type: "Request",
            Title: "Request request Rejected",
            Text: "Your request for the Request has been Rejected",
            Date: new Date(),
        };

        await Users.findByIdAndUpdate(UserId, {
            $push: {
                Notifications: Notificatio_ToSend,
            },
        }).exec();
        return res.status(200).json({ message: "Request request rejected." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_get_user_Requests = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);
    if (isAuth.status == false)
        return res.status(401).json({
            message: "Unauthorized: Invalid",
        });

    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("admin_accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const { userId } = req.params;
        if (!userId) {
            return res.status(409).json({ message: "userId is required." });
        }
        const Requests = await requests.find({ User: userId });
        return res.status(200).json({ Requests });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: error });
    }
};
module.exports = {
    handle_Accept_request,
    handle_Reject_request,
    handle_get_Requests,
    handle_get_user_Requests,
};
