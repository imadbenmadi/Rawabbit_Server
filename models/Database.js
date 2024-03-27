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
        IsEmailVerified: { type: Boolean, default: false },
        Notifications: [
            {
                Type: { type: String },
                Title: { type: String },
                Text: { type: String },
                Description: { type: String },
                Date: { type: Date, default: Date.now },
                Readed: { type: Boolean, default: false },
            },
        ],
        Date: { type: Date, default: Date.now },
        Websites: [{ type: mongoose.Types.ObjectId, ref: "Websites" }],
        Requests: [{ type: mongoose.Types.ObjectId, ref: "requests" }],
    })
);

const email_verification_tokens = mongoose.model(
    "email_verification_tokens",
    new mongoose.Schema({
        userId: { type: mongoose.Types.ObjectId, ref: "Users" },
        token: { type: String },
        expire: { type: Date, default: Date.now() + 24 * 60 * 60 * 1000 },
        Date: { type: Date, default: Date.now },
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
        User: { type: mongoose.Types.ObjectId, ref: "Users" },
        Readed: { type: Boolean, default: false },
    })
);
const requests = mongoose.model(
    "requests",
    new mongoose.Schema({
        User: { type: mongoose.Types.ObjectId, ref: "Users" },
        Link: { type: String },
        Title: { type: String },
        Text: { type: String },
        Description: { type: String },
        Image: { type: String },
        Category: { type: String },
        Date: { type: Date, default: Date.now },
        Message: { type: String },
    })
);
// Services Courses Blogs Events
const Websites = mongoose.model(
    "Websites",
    new mongoose.Schema({
        User: { type: mongoose.Types.ObjectId, ref: "Users" },
        Link: { type: String },
        Title: { type: String },
        Text: { type: String },
        Description: { type: String },
        Image: { type: String },
        Category: { type: String },
        Date: { type: Date, default: Date.now },
        // Comments: [
        //     {
        //         User: { type: mongoose.Types.ObjectId, ref: "Users" },
        //         Text: { type: String },
        //         Date: { type: Date, default: Date.now },
        //     },
        // ],
        // Ratings: [
        //     {
        //         User: { type: mongoose.Types.ObjectId, ref: "Users" },
        //         Rating: { type: Number },
        //         Date: { type: Date, default: Date.now },
        //     },
        // ],
        Likes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
        Dislikes: [{ type: mongoose.Types.ObjectId, ref: "Users" }],
        Visits: { type: Number, default: 0 },
    })
);

module.exports = {
    Users,
    Refresh_tokens,
    Messages,
    requests,
    Websites,
    Admin_data,
    email_verification_tokens,
};
