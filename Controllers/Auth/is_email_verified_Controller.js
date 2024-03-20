const { Users } = require("../../models/Database");

const handle_check = async (req, res) => {
    try {
        const userId = req.body.userId;
        if (!userId) return res.status(409).json({ message: "messing Data" });
        const user = await Users.findById(userId).select("IsEmailVerified");
        if (!user) {
            return res.status(404).json({ message: "User Not Found" });
        }
        return res.status(200).json({ IsEmailVerified: user.IsEmailVerified });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
module.exports = { handle_check };
