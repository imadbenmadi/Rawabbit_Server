const { Websites, Users } = require("../../models/Database");
const path = require("path");
const fs = require("fs");
const Verify_Admin = require("../../Middleware/Verify_Admin");
const Delete_image = (generatedFilename) => {
    const imagePath = path.join(
        __dirname,
        "../../Public/Websites_Images",
        generatedFilename
    );
    try {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
    } catch (err) {
        console.error("Error deleting image:", err);
    }
};
const handle_add_Websites = async (req, res) => {
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
        const { Title, Text, Description, Category, Link } = req.body;
        if (!Title || !Text || !Description || !Category || !Link) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }
        const generatedFilename = req.body.generatedFilename;
        const newWebsite = new Websites({
            Link,
            Title,
            Text,
            Description,
            Category,
            Image: generatedFilename,
        });
        // Save the Website to the database
        await newWebsite.save();
        return res.status(200).json({ message: "Website added successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_delete_Websites = async (req, res) => {
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
                .json({ message: "WebsiteId field is required." });
        }

        // Find the Website by id
        const Website = await Websites.findById(id);

        // Check if the Website exists
        if (!Website) {
            return res.status(404).json({ message: "Website not found." });
        }

        // Check if the Website has an associated image
        if (Website.Image) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Websites_Images",
                Website.Image
            );
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            });
        }

        // Delete the Website from the database
        await Websites.findByIdAndDelete(id);

        // Delete any related requests for this Website
        await request_Website.deleteMany({ Website: id });

        return res
            .status(200)
            .json({ message: "Website deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_update_Websites = async (req, res) => {
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
        const { Title, Text, Description, Price, Category, date } = req.body;
        const { id } = req.params;
        if (!id) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(409).json({ message: "Website ID Not Found." });
        }
        const Website = await Websites.findById(id);
        if (!Website) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(404).json({ message: "Website not found." });
        }
        if (req.file) {
            if (Website.Image) {
                const imagePath = path.join(
                    __dirname,
                    "../../Public/Websites_Images",
                    Website.Image
                );
                fs.unlinkSync(imagePath);
                console.log("Previous image deleted successfully");
            }
            // Set the new image filename to the Website
            Website.Image = req.body.generatedFilename;
        }
        // Update each field if provided in the request body
        if (Title) {
            Website.Title = Title;
        }
        if (Text) {
            Website.Text = Text;
        }
        if (Description) {
            Website.Description = Description;
        }
        if (Price) {
            Website.Price = Price;
        }
        if (Category) {
            Website.Category = Category;
        }
        if (date) {
            Website.Date = date;
        }
        // Save the updated Website
        await Website.save();
        return res
            .status(200)
            .json({ message: "Website updated successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_get_Websites_Request = async (req, res) => {
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
        const requests = await request_Website
            .find()
            .populate({
                path: "User",
                select: "FirstName LastName Email Telephone IsEmailVerified ", // Specify the fields you want to include
            })
            .populate("Website");
        return res.status(200).json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_Accept_Website_request = async (req, res) => {
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
        const { UserId, WebsiteId } = req.body;

        if (!UserId || !WebsiteId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }

        // Remove the request from the database
        await request_Website.deleteMany({ User: UserId, Website: WebsiteId });

        const Notificatio_ToSend = {
            Type: "Website",
            Title: "Website request accepted",
            Text: "Your request for the Website has been accepted",
            Date: new Date(),
        };
        // Add the Website to the user's list of Websites , adn Notify him
        await Users.findByIdAndUpdate(UserId, {
            $push: {
                Websites: WebsiteId,
                Notifications: Notificatio_ToSend,
            },
        }).exec();

        return res.status(200).json({ message: "Website request accepted." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_Reject_Website_request = async (req, res) => {
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
        const { UserId, WebsiteId } = req.body;

        if (!UserId || !WebsiteId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }

        // Remove the request from the database
        await request_Website.deleteMany({ User: UserId, Website: WebsiteId });
        const Notificatio_ToSend = {
            Type: "Website",
            Title: "Website request Rejected",
            Text: "Your request for the Website has been Rejected",
            Date: new Date(),
        };

        await Users.findByIdAndUpdate(UserId, {
            $push: {
                Notifications: Notificatio_ToSend,
            },
        }).exec();
        return res.status(200).json({ message: "Website request rejected." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
module.exports = {
    handle_add_Websites,
    handle_Accept_Website_request,
    handle_Reject_Website_request,
    handle_delete_Websites,
    handle_update_Websites,
    handle_get_Websites_Request,
};
