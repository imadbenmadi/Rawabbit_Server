const { Events, Users } = require("../../models/Database");
const Verify_Admin = require("../../Middleware/Verify_Admin");
const path = require("path");
const fs = require("fs");

const Delete_image = (generatedFilename) => {
    const imagePath = path.join(
        __dirname,
        "../../Public/Events",
        generatedFilename
    );
    try {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
    } catch (err) {
        console.error("Error deleting image:", err);
    }
};

const handle_add_Event = async (req, res) => {
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
        const { Title, Text, Description } = req.body;

        if (!Title || !Description || !Text) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }
        const generatedFilename = req.body.generatedFilename;

        const NewBlog = new Events({
            Title,
            Text,
            Description,
            Image: generatedFilename,
        });
        await NewBlog.save();
        // Push notification to all users
        const notificationToSend = {
            Type: "event",
            Title: "New Event Added",
            Text: `A new event "${Title}" has been added.`,
            Date: new Date(),
        };

        const users = await Users.find({}, { _id: 1 }).exec();
        const userIds = users.map((user) => user._id);

        await Users.updateMany(
            { _id: { $in: userIds } },
            { $push: { Notifications: notificationToSend } }
        );
        return res.status(200).json({ message: "Event Created Successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_delete_Event = async (req, res) => {
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
                .json({ message: "Event Id field is required." });
        }

        // Find the event by id
        const event = await Events.findById(id);

        // Check if the event exists
        if (!event) {
            return res.status(404).json({ message: "Event not found." });
        }

        if (event.Image) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Events",
                event.Image
            );
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            });
        }

        // Delete the event from the database
        await Events.findByIdAndDelete(id);

        return res.status(200).json({ message: "Event deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

const handle_update_Event = async (req, res) => {
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
        const { Title, Text, Description, date } = req.body;
        const { id } = req.params;
        if (!id) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(409).json({ message: "evente ID is required." });
        }
        const evente = await Events.findById(id);
        if (!evente) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(404).json({ message: "evente not found." });
        }
        if (req.file) {
            if (evente.Image) {
                const imagePath = path.join(
                    __dirname,
                    "../../Public/Events",
                    evente.Image
                );
                fs.unlinkSync(imagePath);
                console.log("Previous image deleted successfully");
            }
            // Set the new image filename to the eventes
            evente.Image = req.generatedFilename;
        }
        // Update each field if provided in the request body
        if (Title) {
            evente.Title = Title;
        }
        if (Text) {
            evente.Text = Text;
        }
        if (Description) {
            evente.Description = Description;
        }
        
        if (date) {
            evente.Date = date;
        }
        // Save the updated evente
        await evente.save();
        return res
            .status(200)
            .json({ message: "evente updated successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
module.exports = { handle_add_Event, handle_delete_Event, handle_update_Event };
