const { Users , request_Course, request_Service } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/verify_user");
const EditProfile = async (req, res) => {
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
        const { userId } = req.params;
        if (!userId) {
            return res.status(409).json({ message: "Messing Data" });
        }

        const userToUpdate = await Users.findById(userId);
        if (!userToUpdate) {
            return res.status(404).json({ message: "User not found." });
        }

        // Extract fields that can be modified from the request body
        const { FirstName, LastName, Email, Age, Gender, Telephone } = req.body;

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

        if (Age) {
            userToUpdate.Age = Age;
        }
        if (Gender) {
            userToUpdate.Gender = Gender;
        }
        if (Telephone) {
            userToUpdate.Telephone = Telephone;
        }

        // Save the updated user
        await userToUpdate.save();

        return res
            .status(200)
            .json({ message: "Profile updated successfully" });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const getProfile = async (req, res) => {
    const userId = req.params.id;

    if (!userId) return res.status(409).json({ message: "Messing Data" });
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
        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(401).json({ message: "user not found." });
        }
        const Courses_requests = await request_Course.find({ user: userId });
        const Services_requests = await request_Service.find({ user: userId });
        const userData = {
            user: user_in_db,
            Courses_requests,
            Services_requests,
        };
        return res.status(200).json({ userData});
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const DeleteProfile = async (req, res) => {
    const {userId} = req.params;

    if (!userId) return res.status(409).json({ message: "Messing Data" });
    try {
        const verified = await Verify_user(req, res);
        if (!verified) {
            return res
                .status(401)
                .json({ message: "Unauthorized: Invalid token" });
        }

        const user_in_db = await Users.findById(userId);
        if (!user_in_db) {
            return res.status(404).json({ message: "User not found." });
        }

        await Users.findByIdAndDelete(userId);
        return res.status(200).json(user_in_db);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

module.exports = {
    EditProfile,
    getProfile,
    DeleteProfile,
};
