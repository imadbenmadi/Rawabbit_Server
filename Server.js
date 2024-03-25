const express = require("express");
const rateLimit = require("express-rate-limit");
const app = express();
const multer = require("multer");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const corsOptions = {
    origin: "*", // Allow access from all origins
    optionsSuccessStatus: 200,
};

const credentials = (req, res, next) => {
    res.header("Access-Control-Allow-Credentials", true);
    next();
};

require("dotenv").config();

const limiter = rateLimit({
    windowMs: 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 100 requests per windowMs
    message: "Too many requests, try again later.",
});

app.use(limiter);
app.use(cookieParser());
app.use(credentials);
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/", express.static(path.join(__dirname, "/Public")));

mongoose.set("strictQuery", false);
const mongoDB = process.env.MONGO_URI;

async function connect_to_db() {
    await mongoose.connect(mongoDB);
    console.log("Connected to Database");
}

connect_to_db().catch((err) => console.log(err));

app.get("/", (req, res) => {
    res.send("Hello From Rawabbit");
});
app.use("/check_Auth", require("./Routes/Auth/check_Auth"));
app.use("/VerifyAccount", require("./Routes/Auth/verifyAccount"));
app.use(
    "/Send_Verification_Email",
    require("./Routes/Auth/Send_Verification_Email")
);
app.use(
    "/ReSend_Verification_Email",
    require("./Routes/emails/Resend_verification")
);
app.use("/is_email_verified", require("./Routes/Auth/is_email_verified"));

app.use("/Login", require("./Routes/Auth/Login"));
app.use("/Register", require("./Routes/Auth/Register"));
app.use("/Logout", require("./Routes/Auth/Logout"));

app.use("/Profile", require("./Routes/Profile"));
app.use("/Contact", require("./Routes/Contact"));

app.use("/Dashboard/Login", require("./Routes/Dashboard/Admin_Login"));
app.use(
    "/Dashboard/check_Auth",
    require("./Routes/Dashboard/check_Admin_Auth")
);
app.use("/Dashboard/Users", require("./Routes/Dashboard/Users"));
// app.use("/Dashboard/AddAdmin", require("./Routes/Dashboard/Add_Admin"));

// app.use("/Dashboard", require("./Routes/Dashboard/Dashboard"));
// app.use(verifyJWT);

app.listen(3000);

module.exports = app;
