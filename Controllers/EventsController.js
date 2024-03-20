const { Events, Users } = require("../models/Database");
require("dotenv").config();
const getAllEvents = async (req, res) => {
    try {
        // const page = parseInt(req.query.page) || 1;
        // let limit = parseInt(req.query.limit) || 20;
        // const totalCount = await Events.countDocuments();
        // const totalPages = Math.ceil(totalCount / limit);
        // const skip = (page - 1) * limit;

        // const events = await Events.find({}).skip(skip).limit(limit);
        const events = (await Events.find({})).reverse();
        // return res.status(200).json({ totalPages, events });
        return res.status(200).json({ events });
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};
const get_Event_ById = async (req, res) => {
    const EventId = req.params.id;

    if (!EventId) {
        return res.status(409).json({ message: "Messing Data" });
    }

    try {
        const Event = await Events.findById(EventId);

        if (!Event) {
            return res.status(404).json({ message: "Event not found." });
        }

        return res.status(200).json(Event);
    } catch (error) {
        return res.status(500).json({ message: error });
    }
};

module.exports = {
    getAllEvents,
    get_Event_ById,
};
