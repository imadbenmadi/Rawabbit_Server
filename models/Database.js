const mongoose = require("mongoose");

const Users = mongoose.model(
    "Users",
    new mongoose.Schema({
        FirstName: { type: String, required: true },
        LastName: { type: String, required: true },
        Telephone: { type: String, required: true },
        Email: { type: String, required: true },
        Password: { type: String, required: true },
        Age: { type: Number },
        Gender: { type: String, enum: ["male", "female"] },
        ProfilePic: { type: String },
        Courses: [{ type: mongoose.Types.ObjectId, ref: "Courses" }],
        Services: [
            {
                type: mongoose.Types.ObjectId,
                ref: "Services",
                service_state: { type: String },
            },
        ],
        IsEmailVerified: { type: Boolean, default: false },
        Notifications: [
            {
                Type: {
                    type: String,
                    enum: [
                        "verify",
                        "contact",
                        "event",
                        "course",
                        "service",
                        "blog",
                        "message",
                        "other",
                    ],
                },
                Title: { type: String },
                Text: { type: String },
                Description: { type: String },
                Date: { type: Date , default: Date.now},
                Readed: { type: Boolean, default: false },
            },
        ],
    })
);

const email_verification_tokens = mongoose.model(
    "email_verification_tokens",
    new mongoose.Schema({
        userId: { type: mongoose.Types.ObjectId, ref: "Users" },
        token: { type: String },
        expire: { type: Date, default: Date.now() + 24 * 60 * 60 * 1000 },
        Date: { type: Date, default: Date.now }

    })
);
const Refresh_tokens = mongoose.model(
    "refresh_tokens",
    new mongoose.Schema({
        userId: { type: mongoose.Types.ObjectId, ref: "Users" },
        token: { type: String },
    })
);
// Dash Board
const Admin_data = mongoose.model(
    "Admin_data",
    new mongoose.Schema({
        Admin_User_Name: { type: String },
        Admin_Pwd: { type: String },
    })
);

const Messages = mongoose.model(
    "Messages",
    new mongoose.Schema({
        Title: { type: String },
        Message: { type: String },
        Date: { type: Date },
        Sender_id: { type: mongoose.Types.ObjectId, ref: "Users" },
        Sender_email: { type: String },
    })
);
const request_Course = mongoose.model(
    "request_Course",
    new mongoose.Schema({
        User: { type: mongoose.Types.ObjectId, ref: "Users" },
        Course: { type: mongoose.Types.ObjectId, ref: "Courses" },
        Date: { type: Date, default: Date.now }

    })
);
const request_Service = mongoose.model(
    "request_Service",
    new mongoose.Schema({
        User: { type: mongoose.Types.ObjectId, ref: "Users" },
        Service: { type: mongoose.Types.ObjectId, ref: "Services" },
        Date: { type: Date, default: Date.now }

    })
);
// Services Courses Blogs Events
const Services = mongoose.model(
    "Services",
    new mongoose.Schema({
        Title: { type: String },
        Text: { type: String },
        Description: { type: String },
        Image: { type: String },
        Category: { type: String },
        Price: { type: Number },
    })
);

const Courses = mongoose.model(
    "Courses",
    new mongoose.Schema({
        Title: { type: String },
        Text: { type: String },
        Description: { type: String },
        Image: { type: String },
        Price: { type: Number },
        Category: { type: String },
    })
);
const Blogs = mongoose.model(
    "Blogs",
    new mongoose.Schema({
        Title: { type: String },
        Text: { type: String },
        Description: { type: String },
        Image: { type: String },
        Date: { type: Date, default: Date.now }

    })
);
const Events = mongoose.model(
    "Events",
    new mongoose.Schema({
        Title: { type: String },
        Text: { type: String },
        Description: { type: String },
        Date: { type: Date, default: Date.now },
        Image: { type: String },
    })
);
module.exports = {
    Users,
    Refresh_tokens,
    Messages,
    request_Course,
    request_Service,
    Services,
    Courses,
    Blogs,
    Events,
    Admin_data,
    email_verification_tokens,
};
