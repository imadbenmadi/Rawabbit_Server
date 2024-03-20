const {
    Users,
    request_Course,
    request_Service,
    Courses,
    Services,
} = require("../../models/Database");
const ObjectId = require("mongoose").Types.ObjectId; // Import ObjectId from mongoose
const { Types } = require("mongoose");
const mongoose = require("mongoose");

const Verify_Admin = require("../../Middleware/Verify_Admin");

const handle_add_User = async (req, res) => {
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
        const { FirstName, LastName, Email, Password, Age, Gender, Telephone } =
            req.body;

        const isValidTelephone = /^(0)(5|6|7)[0-9]{8}$/.test(Telephone);

        if (
            !FirstName ||
            !LastName ||
            !Email ||
            !Password ||
            !Gender ||
            !Telephone
        ) {
            return res.status(409).json({ message: "Missing Data" });
        } else if (FirstName.length < 3) {
            return res
                .status(409)
                .json({ message: "First Name must be more that 3 chars" });
        } else if (LastName.length < 3) {
            return res
                .status(409)
                .json({ message: "Last Name must be more that 3 chars" });
        } else if (FirstName.length > 14) {
            return res.status(409).json({
                message: "First Name must be less than 14 chars",
            });
        } else if (LastName.length > 14) {
            return res.status(409).json({
                message: "LastName must be less than 14 chars",
            });
        } else if (Password.length < 8) {
            return res
                .status(409)
                .json({ message: "Password must be at least 8 characters" });
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(Email)) {
            return res.status(409).json({ message: "Invalid Email" });
        } else if (Gender !== "male" && Gender !== "female") {
            return res.status(409).json({
                message: "Invalid Gender, accepted values: male or female",
            });
        } else if (Telephone.length < 9) {
            return res
                .status(409)
                .json({ message: "Telephone must be at least 9 characters" });
        } else if (!isValidTelephone) {
            return res
                .status(409)
                .json({ message: "Telephone must be a number" });
        } else if (Age && isNaN(Age)) {
            return res.status(409).json({ message: "Age must be a number" });
        }
        const existingUser = await Users.findOne({ Email: Email });
        if (existingUser) {
            return res.status(404).json({ message: "Email already exists" });
        }
        const newUser = new Users({
            FirstName: FirstName,
            LastName: LastName,
            Email: Email,
            Telephone: Telephone,
            Password: Password,
            Age: Age,
            Gender: Gender,
        });
        await newUser.save();
        return res.status(200).json({
            message: "Account Created Successfully",
            _id: newUser._id,
            Date: new Date(),
        });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_delete_User = async (req, res) => {
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
        const id = req.params.id;
        if (!id) {
            return res.status(409).json({ message: "User ID is required." });
        }
        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        await Users.findByIdAndDelete(id);
        return res.status(200).json({ message: "User Deleted Successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_modify_User = async (req, res) => {
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
        const {
            id,
            CoursesToAdd,
            CoursesToRemove,
            ServicesToAdd,
            ServicesToRemove,
            NotificationsToAdd,
        } = req.body;
        if (!id) {
            return res.status(409).json({ message: "Messing Data" });
        }

        const userToUpdate = await Users.findById(id);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found." });
        }

        // Extract fields that can be modified from the request body
        const {
            FirstName,
            LastName,
            Email,
            Password,
            Age,
            Gender,
            Telephone,
            IsEmailVerified,
        } = req.body;

        // Update individual fields
        if (FirstName) {
            userToUpdate.FirstName = FirstName;
        }
        if (LastName) {
            userToUpdate.LastName = LastName;
        }
        if (Email) {
            userToUpdate.Email = Email;
        }
        if (Password) {
            userToUpdate.Password = Password;
        }
        if (Age) {
            userToUpdate.Age = Age;
        }
        if (Gender) {
            userToUpdate.Gender = Gender;
        }
        if (Telephone) {
            userToUpdate.Telephone = Telephone;
        }
        if (typeof IsEmailVerified === "boolean") {
            userToUpdate.IsEmailVerified = IsEmailVerified;
        }

        if (CoursesToAdd && CoursesToAdd.length > 0) {
            const coursesToAddUnique = CoursesToAdd.filter(
                (course) => !userToUpdate.Courses.includes(course)
            );
            userToUpdate.Courses.push(...coursesToAddUnique);
        }

        if (CoursesToRemove && CoursesToRemove.length > 0) {
            try {
                for (const courseId of CoursesToRemove) {
                    // Find the index of the courseId in userToUpdate.Courses
                    const indexToRemove = userToUpdate.Courses.findIndex(
                        (course) => String(course) === courseId
                    );

                    // Remove the courseId if found
                    if (indexToRemove !== -1) {
                        userToUpdate.Courses.splice(indexToRemove, 1);
                    } else {
                    }
                }
            } catch (error) {
                return res.status(500).json({ message: error });
            }
        }

        // Update Services
        if (ServicesToAdd && ServicesToAdd.length > 0) {
            const servicesToAddUnique = ServicesToAdd.filter(
                (service) => !userToUpdate.Services.includes(service)
            );
            userToUpdate.Services.push(...servicesToAddUnique);
        }
        if (ServicesToRemove && ServicesToRemove.length > 0) {
            try {
                for (const serviceId of ServicesToRemove) {
                    // Find the index of the serviceId in userToUpdate.Services
                    const indexToRemove = userToUpdate.Services.findIndex(
                        (service) => String(service) === serviceId
                    );

                    // Remove the serviceId if found
                    if (indexToRemove !== -1) {
                        userToUpdate.Services.splice(indexToRemove, 1);
                    } else {
                    }
                }
            } catch (error) {
                return res.status(500).json({ message: error });
            }
        }

        // Update Notifications
        if (NotificationsToAdd && NotificationsToAdd.length > 0) {
            userToUpdate.Notifications.push(...NotificationsToAdd);
        }

        // Save the updated user
        await userToUpdate.save();

        return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

const getAllUsers = async (req, res) => {
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
        const users = await Users.find({}, { Notifications: 0 }); // Exclude the Notifications field
        return res.status(200).json(users);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

const get_user = async (req, res) => {
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
        const id = req.params.id;
        if (!id) {
            return res.status(409).json({ message: "User ID is required." });
        }
        const user = await Users.findById(id)
            .populate("Services")
            .populate("Courses");
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_notify_User = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);

    if (isAuth.status == false) {
        return res.status(401).json({
            message: "Unauthorized: Invalidtoken",
        });
    }
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("admin_accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        const id = req.params.id;
        const { Title, Text, Description } = req.body;
        const Type = req.body.Type || "other";
        if (!id) {
            return res.status(409).json({ message: "User ID is required." });
        }
        if (!Title || !Text || !Description) {
            return res.status(409).json({
                message: "Title and Text and Description are required.",
            });
        }
        const user_in_db = await Users.findById(id);
        if (!user_in_db) {
            return res.status(404).json({ message: "User not found." });
        }
        const notification = {
            Type: Type,
            Title: Title,
            Text: Text,
            Description: Description,
            Date: new Date(),
        };
        user_in_db.Notifications.push(notification);
        await user_in_db.save();
        return res
            .status(200)
            .json({ message: "Notification sent successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_user_course_requests = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);

    if (isAuth.status == false) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("admin_accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(409).json({ message: "User ID is required." });
        }
        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const courseRequests = await request_Course
            .find({ User: id })
            .populate("User")
            .populate("Course");
        return res.status(200).json(courseRequests);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_user_service_requests = async (req, res) => {
    const isAuth = await Verify_Admin(req, res);

    if (isAuth.status == false) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }
    if (isAuth.status == true && isAuth.Refresh == true) {
        res.cookie("admin_accessToken", isAuth.newAccessToken, {
            httpOnly: true,
            sameSite: "None",
            secure: true,
            maxAge: 60 * 60 * 1000,
        });
    }
    try {
        const id = req.params.id;
        if (!id) {
            return res.status(409).json({ message: "User ID is required." });
        }
        const user = await Users.findById(id)
            ;
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }
        const serviceRequests = await request_Service
            .find({ User: id })
            .populate("User")
            .populate("Service");
        return res.status(200).json(serviceRequests);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const delete_user_course = async (req, res) => {
    try {
        const isAuth = await Verify_Admin(req, res);

        if (!isAuth.status) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (isAuth.Refresh) {
            res.cookie("admin_accessToken", isAuth.newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000,
            });
        }

        const { id, course_id } = req.params;
        // Validate input parameters
        if (!id || !course_id) {
            return res
                .status(400)
                .json({ message: "User ID and Course ID are required." });
        }

        // Find the user by ID
        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Find the course by ID
        const course = await Courses.findById(course_id);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }

        // Check if the user owns the specified course
        const indexToRemove = user.Courses.findIndex(
            (course) => String(course) === course_id
        );
        if (indexToRemove === -1) {
            return res
                .status(404)
                .json({ message: "User does not own this course." });
        }

        // Remove the course from the user's list of courses
        user.Courses.splice(indexToRemove, 1);
        await user.save();

        return res
            .status(200)
            .json({ message: "Course deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
const delete_user_service = async (req, res) => {
    try {
        const isAuth = await Verify_Admin(req, res);

        if (!isAuth.status) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (isAuth.Refresh) {
            res.cookie("admin_accessToken", isAuth.newAccessToken, {
                httpOnly: true,
                sameSite: "None",
                secure: true,
                maxAge: 60 * 60 * 1000,
            });
        }

        const { id, service_id } = req.params;
        // Validate input parameters
        if (!id || !service_id) {
            return res
                .status(400)
                .json({ message: "User ID and Service ID are required." });
        }

        // Find the user by ID
        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Find the service by ID
        const service = await Services.findById(service_id);
        if (!service) {
            return res.status(404).json({ message: "Service not found." });
        }

        // Check if the user owns the specified service
        const indexToRemove = user.Services.findIndex(
            (service) => String(service) === service_id
        );
        if (indexToRemove === -1) {
            return res
                .status(404)
                .json({ message: "User does not own this service." });
        }

        // Remove the service from the user's list of services
        user.Services.splice(indexToRemove, 1);
        await user.save();

        return res
            .status(200)
            .json({ message: "Service deleted successfully." });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
module.exports = {
    handle_add_User,
    handle_delete_User,
    handle_modify_User,
    getAllUsers,
    get_user,
    handle_notify_User,
    get_user_course_requests,
    get_user_service_requests,
    delete_user_course,
    delete_user_service,
};
