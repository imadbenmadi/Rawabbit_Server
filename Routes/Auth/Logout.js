const express = require("express");
const router = express.Router();
const logoutController = require("../../Controllers/Auth/LogoutController");

router.post("/", logoutController.handleLogout);

module.exports = router;
