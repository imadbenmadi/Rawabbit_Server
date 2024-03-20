const mongoose = require("mongoose");
const { Services, request_Service, Users } = require("../../models/Database");
const jwt = require("jsonwebtoken");

const Verify_Admin = require("../../Middleware/Verify_Admin");

const path = require("path");
const fs = require("fs");
const Delete_image = (generatedFilename) => {
    const imagePath = path.join(
        __dirname,
        "../../Public/Services",
        generatedFilename
    );
    try {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
    } catch (err) {
        console.error("Error deleting image:", err);
    }
};

const handle_get_Services_Request = async (req, res) => {
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
        const requests = await request_Service
            .find()
            .populate({
                path: "User",
                select: "FirstName LastName Email Telephone IsEmailVerified ", // Specify the fields you want to include
            })
            .populate("Service");
        return res.status(200).json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

const handle_add_Service = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);

    if (isAuth.status == false) {
         if (req.body.generatedFilename) {
             Delete_image(req.body.generatedFilename);
        }
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("admin_accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const { Title, Text, Description, Price, Category } = req.body;
        if (!Title || !Text || !Description || !Price || !Category) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res
                .status(409)
                .json({ message: "All fields are required." });
        } else if (isNaN(Price)){
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(409).json({ message: "Invalide Price" });
        }
        const creationDate = new Date();
        const generatedFilename = req.body.generatedFilename;

        // Create a new Service
        const newService = new Services({
            Title,
            Text,
            Description,
            Price,
            Image: generatedFilename,
            Category,
        });

        // Save the Service to the database
        await newService.save();

        return res.status(200).json({ message: "Service added successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_delete_Service = async (req, res) => {
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
        const { id } = req.params;
        if (!id) {
            return res
                .status(409)
                .json({ message: "ServiceId field is required." });
        }

        // Find the service by id
        const service = await Services.findById(id);

        // Check if the service exists
        if (!service) {
            return res.status(404).json({ message: "Service not found." });
        }

        // Check if the service has an associated image
        if (service.Image) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Services",
                service.Image
            );
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            });
        }

        // Delete the service from the database
        await Services.findByIdAndDelete(id);

        // Delete any related requests for this service
        await request_Service.deleteMany({ Service: id });

        return res
            .status(200)
            .json({ message: "Service deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

const handle_update_Service = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);

    if (isAuth.status == false) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(401).json({ message: "Unauthorized: Invalid token" });
    }
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("admin_accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000, // 10 minutes in milliseconds
        });
    }
    try {
        const { Title, Text, Description,  Price, Category, date } =
            req.body;
        const { id } = req.params;

        if (!id) {

            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res
                .status(409)
                .json({ message: "Could not find Service Id." });
        }
        const service = await Services.findById(id);
        if (!service) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(404).json({ message: "service not found." });
        }

        if (req.file) {
            if (service.Image) {
                const imagePath = path.join(
                    __dirname,
                    "../../Public/Services",
                    service.Image
                );
                fs.unlinkSync(imagePath);
                console.log("Previous image deleted successfully");
            }
            // Set the new image filename to the Services
            service.Image = req.generatedFilename;
        }
        // Update each field if provided in the request body
        if (Title) {
            service.Title = Title;
        }
        if (Text) {
            service.Text = Text;
        }
        if (Description) {
            service.Description = Description;
        }
        if (Price) {
            service.Price = Price;
        }
        if (Category) {
            service.Category = Category;
        }
        if (date) {
            service.Date = date;
        }
        await service.save();
        return res
            .status(200)
            .json({ message: "service updated successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_Accept_Service_request = async (req, res) => {
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
        const { UserId, ServiceId } = req.body;
        if (!UserId || !ServiceId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }

        // Remove the request from the database
        await request_Service.deleteMany({ User: UserId, Service: ServiceId });

        // Add the Service to the user's list of Services
        await Users.updateOne(
            { _id: UserId },
            {
                $push: {
                    Services: { $each: [ServiceId], $position: 0 },
                    service_state: "pending",
                },
            }
        );
        // Push a notification to the user
        const notificationToSend = {
            Type: "service",
            Title: "Service request accepted",
            Text: "Your request for the service has been accepted",
            Date: new Date(),
        };
        await Users.findByIdAndUpdate(UserId, {
            $push: {
                Services: ServiceId,
                Notifications: notificationToSend,
            },
        }).exec();
        return res.status(200).json({ message: "Service request accepted." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_Reject_Service_request = async (req, res) => {
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
        const { UserId, ServiceId } = req.body;

        if (!UserId || !ServiceId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }

        // Remove the request from the database
        await request_Service.deleteMany({ User: UserId, Service: ServiceId });
        // Push a notification to the user
        const notificationToSend = {
            Type: "service",
            Title: "Service request Rejected",
            Text: "Your request for the service has been Rejected",
            Date: new Date(),
        };
        await Users.findByIdAndUpdate(UserId, {
            $push: { Notifications: notificationToSend },
        }).exec();
        return res.status(200).json({ message: "Service request rejected." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
module.exports = {
    handle_get_Services_Request,
    handle_add_Service,
    handle_Accept_Service_request,
    handle_Reject_Service_request,
    handle_delete_Service,
    handle_update_Service,
};
