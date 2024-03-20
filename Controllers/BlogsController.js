const { Blogs, Users } = require("../models/Database");
require("dotenv").config();
const getAllBlogs = async (req, res) => {
    // const page = parseInt(req.query.page) || 1;
    // let limit = parseInt(req.query.limit) || 20;
    try {
        // const totalCount = await Blogs.countDocuments();
        // const totalPages = Math.ceil(totalCount / limit);
        // const skip = (page - 1) * limit;
        // const blogs = await Blogs.find().skip(skip).limit(limit);
        const blogs = (await Blogs.find()).reverse();
        // return res.status(200).json({ totalPages, blogs });
        return res.status(200).json({ blogs });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_Blog_ById = async (req, res) => {
    const blogId = req.params.id;

    if (!blogId) {
        return res.status(409).json({ message: "Messing Data" });
    }

    try {
        const blog = await Blogs.findById(blogId);

        if (!blog) {
            return res.status(404).json({ message: "blog not found." });
        }

        return res.status(200).json(blog);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

module.exports = {
    getAllBlogs,
    get_Blog_ById,
};
