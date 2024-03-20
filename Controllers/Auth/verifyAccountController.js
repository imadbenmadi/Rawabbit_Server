require("dotenv").config();
const { Users, email_verification_tokens } = require("../../models/Database");

const handleVerifyAccount = async (req, res) => {
    try {
        const { Code, userId } = req.body;
        if (!Code || !userId) {
            return res.status(409).json({ message: "Missing Data" });
        }
        const verificationToken = await email_verification_tokens.findOne({
            userId: userId,
        });
        if (!verificationToken.token) {
            return res
                .status(404)
                .json({ message: "Verification token not found" });
        }
        if (verificationToken.token != Code) {
            return res
                .status(409)
                .json({ message: "Invalid verification code" });
        }
        if (verificationToken.expire < new Date()) {
            return res
                .status(409)
                .json({ message: "Verification token has expired" });
        }
        const user = await Users.findById(verificationToken.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (user.IsEmailVerified === true) {
            return res
                .status(200)
                .json({ message: "Account Already Verified" });
        }
        user.IsEmailVerified = true;
        await user.save();

        // Remove the verification token from the database
        await email_verification_tokens.deleteOne({
            _id: verificationToken._id,
        });

        return res
            .status(200)
            .json({ message: "Account Verified Successfully" });
    } catch (err) {
        return res.status(500).json({
            message: err,
        });
    }
};

module.exports = { handleVerifyAccount };
