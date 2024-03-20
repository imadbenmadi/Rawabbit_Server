const { Messages } = require("../models/Database");

const handleContact = async (req, res) => {
    try {
        const { Email, title, message, id } = req.body;
        if (!title || !message) {
            return res.status(409).json({ message: "Missing Data" });
        } else if (
            Email &&
            !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(Email)
        ) {
            return res.status(409).json({ message: "Invalid Email" });
        }
        try {
            if (Email) {
                await Messages.create({
                    Title: title,
                    Message: message,
                    Date: new Date(),
                    Sender_email: Email,
                });
                return res.status(200).json({
                    message: "Message Sent Successfully via Email",
                });
            } else if (id) {
                await Messages.create({
                    Title: title,
                    Message: message,
                    Date: new Date(),
                    Sender_id: id,
                });
                return res.status(200).json({
                    message: "Message Sent Successfully via id",
                });
            } else if (!Email && !id) {
                return res.status(409).json({ message: "Missing Data" });
            }
        } catch (err) {
            return res.status(500).json({ err });
        }
    } catch (err) {
        return res.status(500).json({message :  err });
    }
};
module.exports = { handleContact };
