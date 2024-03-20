const express = require("express");
const router = express.Router();
const is_email_verified_Controller = require("../../Controllers/Auth/is_email_verified_Controller");

router.post("/", is_email_verified_Controller.handle_check);

module.exports = router;
