const express = require("express");
const router = express.Router();
const ContactController = require("../Controllers/ContactController");
router.post("/", ContactController.handleContact);

module.exports = router;
