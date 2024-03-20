const { Courses, request_Course, Users } = require("../../models/Database");
const path = require("path");
const fs = require("fs");
const Verify_Admin = require("../../Middleware/Verify_Admin");
const { log } = require("console");
const Delete_image = (generatedFilename) => {
    const imagePath = path.join(
        __dirname,
        "../../Public/Courses",
        generatedFilename
    );
    try {
        fs.unlinkSync(imagePath);
        console.log("Image deleted successfully");
    } catch (err) {
        console.error("Error deleting image:", err);
    }
};
const handle_add_Courses = async (req, res) => {
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
        const { Title,Text, Description, Price, Category } = req.body;
        if (!Title || !Text || !Description || !Price || !Category) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res
                .status(409)
                .json({ message: "All fields are required." });
        } else if (isNaN(Price)) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(409).json({ message: "Invalide Price" });
        }
        const creationDate = new Date();
        const generatedFilename = req.body.generatedFilename;
        const newCourse = new Courses({
            Title,
            Text,
            Description,
            Price,
            Category,
            Date: creationDate,
            Image: generatedFilename,
        });
        // Save the course to the database
        await newCourse.save();
        return res.status(200).json({ message: "Course added successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_delete_Courses = async (req, res) => {
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
                .json({ message: "CourseId field is required." });
        }

        // Find the course by id
        const course = await Courses.findById(id);

        // Check if the course exists
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // Check if the course has an associated image
        if (course.Image) {
            const imagePath = path.join(
                __dirname,
                "../../Public/Courses",
                course.Image
            );
            fs.unlink(imagePath, (err) => {
                if (err) {
                    console.error("Error deleting image:", err);
                } else {
                    console.log("Image deleted successfully");
                }
            });
        }

        // Delete the course from the database
        await Courses.findByIdAndDelete(id);

        // Delete any related requests for this course
        await request_Course.deleteMany({ Course: id });

        return res
            .status(200)
            .json({ message: "Course deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_update_Courses = async (req, res) => {
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
        const { Title, Text, Description, Price, Category, date } =
            req.body;
        const { id } = req.params;
        if (!id) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(409).json({ message: "Course ID Not Found." });
        }
        const course = await Courses.findById(id);
        if (!course) {
            if (req.body.generatedFilename) {
                Delete_image(req.body.generatedFilename);
            }
            return res.status(404).json({ message: "Course not found." });
        }
        if (req.file) {
            if (course.Image) {
                const imagePath = path.join(
                    __dirname,
                    "../../Public/Courses",
                    course.Image
                );
                fs.unlinkSync(imagePath);
                console.log("Previous image deleted successfully");
            }
            // Set the new image filename to the course
            course.Image = req.body.generatedFilename;
        }
        // Update each field if provided in the request body
        if (Title) {
            course.Title = Title;
        }
        if (Text) {
            course.Text = Text;
        }
        if (Description) {
            course.Description = Description;
        }
        if (Price) {
            course.Price = Price;
        }
        if (Category) {
            course.Category = Category;
        }
        if (date) {
            course.Date = date;
        }
        // Save the updated course
        await course.save();
        return res
            .status(200)
            .json({ message: "Course updated successfully." });
    } catch (error) {
        if (req.body.generatedFilename) {
            Delete_image(req.body.generatedFilename);
        }
        return res.status(500).json({ message: error });
    }
};
const handle_get_Courses_Request = async (req, res) => {
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
        const requests = await request_Course
            .find()
            .populate({
                path: "User",
                select: "FirstName LastName Email Telephone IsEmailVerified ", // Specify the fields you want to include
            })
            .populate("Course");
        return res.status(200).json({ requests });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_Accept_course_request = async (req, res) => {
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
        const { UserId, CourseId } = req.body;

        if (!UserId || !CourseId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }

        // Remove the request from the database
        await request_Course.deleteMany({ User: UserId, Course: CourseId });

        const Notificatio_ToSend = {
            Type: "course",
            Title: "Course request accepted",
            Text: "Your request for the course has been accepted",
            Date: new Date(),
        };
        // Add the course to the user's list of courses , adn Notify him
        await Users.findByIdAndUpdate(UserId, {
            $push: {
                Courses: CourseId,
                Notifications: Notificatio_ToSend,
            },
        }).exec();

        return res.status(200).json({ message: "Course request accepted." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_Reject_course_request = async (req, res) => {
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
        const { UserId, CourseId } = req.body;

        if (!UserId || !CourseId) {
            return res
                .status(409)
                .json({ message: "All fields are required." });
        }

        // Remove the request from the database
        await request_Course.deleteMany({ User: UserId, Course: CourseId });
        const Notificatio_ToSend = {
            Type: "course",
            Title: "Course request Rejected",
            Text: "Your request for the course has been Rejected",
            Date: new Date(),
        };

        await Users.findByIdAndUpdate(UserId, {
            $push: {
                Notifications: Notificatio_ToSend,
            },
        }).exec();
        return res.status(200).json({ message: "Course request rejected." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
module.exports = {
    handle_add_Courses,
    handle_Accept_course_request,
    handle_Reject_course_request,
    handle_delete_Courses,
    handle_update_Courses,
    handle_get_Courses_Request,
};
