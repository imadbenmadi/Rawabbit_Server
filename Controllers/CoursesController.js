const mongoose = require("mongoose");
const { Courses, Users, request_Course } = require("../models/Database");
require("dotenv").config();
const Verify_user = require("../Middleware/verify_user");
const getAllCourses = async (req, res) => {
    // const page = parseInt(req.query.page) || 1;
    // let limit = parseInt(req.query.limit) || 20;

    try {
        // const totalCount = await Courses.countDocuments();
        // const totalPages = Math.ceil(totalCount / limit);
        // const skip = (page - 1) * limit;
        // const courses = await Courses.find().skip(skip).limit(limit);
        const courses = (await Courses.find()).reverse();
        // return res.status(200).json({ totalPages, courses });
        return res.status(200).json({ courses });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_course_ById = async (req, res) => {
    const courseId = req.params.id;
    if (!courseId) {
        return res.status(409).json({ message: "Messing Data" });
    }
    try {
        const course = await Courses.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }
        return res.status(200).json(course);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_courses_By_user_Id = async (req, res) => {
    const userId = req.params._id;
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
        // const page = parseInt(req.query.page) || 1;
        // let limit = parseInt(req.query.limit) || 20;
        // const totalCourses = await Courses.countDocuments();
        // const totalPages = Math.ceil(totalCourses / limit);
        // const skip = (page - 1) * limit;

        const user_in_db = await Users.findById(userId).populate("Courses");
        // .skip(skip)
        // .limit(limit);
        if (!user_in_db) {
            return res.status(401).json({ message: "user not found." });
        }
        return res.status(200).json({ Courses: user_in_db.Courses });
        // .json({ totalPages, Courses: user_in_db.Courses });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const handle_request_Course = async (req, res) => {
    const { CourseId, userId } = req.body;
    if (!CourseId || !userId) {
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
        const existingRequest = await request_Course.findOne({
            User: userId,
            Course: CourseId,
        });

        if (existingRequest) {
            return res
                .status(400)
                .json({ message: "You have already Requested this Course" });
        }
        const course = await Courses.findById(CourseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found." });
        }
        if (user.Courses.includes(CourseId)) {
            return res.status(400).json({ message: "You Own this Course" });
        }
        const new_request_Course = new request_Course({
            User: userId,
            Course: CourseId,
        });
        await new_request_Course.save();
        return res
            .status(200)
            .json({ message: "Course requested successfully." });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
module.exports = {
    getAllCourses,
    get_courses_By_user_Id,
    get_course_ById,
    handle_request_Course,
};
