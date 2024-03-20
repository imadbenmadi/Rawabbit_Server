const { Blogs } = require("../../models/Database");
const path = require("path");
const fs = require("fs");
const Verify_Admin = require("../../Middleware/Verify_Admin");

const Delete_image = (generatedFilename) => {
    const imagePath = path.join(
        __dirname,
        "../../Public/Blogs",
        generatedFilename
    );
    try {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
    } catch (err) {
        console.error("Error deleting image:", err);
    }
};

const handle_add_Blog = async (req, res) => {
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
        const NewBlog = new Blogs({
            Title,
            Text,
            Description,
            Image: generatedFilename,
        });
        await NewBlog.save();

        return res.status(200).json({ message: "Blog Created Successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_delete_Blog = async (req, res) => {
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
                .json({ message: "Blog id field is required." });
        }

        // Find the blog by id
        const blog = await Blogs.findById(id);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({ message: "Blog not found." });
        }

        // Delete the associated image if it exists
        if (blog.Image) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Blogs",
                blog.Image
            );
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            });
        }

        // Delete the blog from the database
        await Blogs.findByIdAndDelete(id);

        return res.status(200).json({ message: "Blog deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

const handle_update_Blog = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);

    if (isAuth.status == false) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
            return res
                .status(401)
                .json({ message: "Unauthorized: Invalid token" });
        }
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
            return res.status(409).json({ message: "blog ID is required." });
        }
        const blog = await Blogs.findById(id);
        if (!blog) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(404).json({ message: "blog not found." });
        }
        if (req.file) {
            if (blog.Image) {
                const imagePath = path.join(
                    __dirname,
                    "../../Public/Blogs",
                    blog.Image
                );
                fs.unlinkSync(imagePath);
                console.log("Previous image deleted successfully");
            }
            // Set the new image filename to the blogs
            blog.Image = req.generatedFilename;
        }
        // Update each field if provided in the request body
        if (Title) {
            blog.Title = Title;
        }
        if (Text) {
            blog.Text = Text;
        }
        if (Description) {
            blog.Description = Description;
        }

        if (date) {
            blog.Date = date;
        }
        // Save the updated blog
        await blog.save();
        return res.status(200).json({ message: "blog updated successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};

module.exports = { handle_add_Blog, handle_delete_Blog, handle_update_Blog };
