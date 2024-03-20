const express = require("express");
const router = express.Router();
const Admin_LogiController = require("../../Controllers/Dashboard/LoginController");

router.post("/", Admin_LogiController.handleLogin);

module.exports = router;
