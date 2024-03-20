const express = require("express");
const router = express.Router();
const verifyAccountController = require("../../Controllers/Auth/verifyAccountController");
router.post("/", verifyAccountController.handleVerifyAccount);

module.exports = router;
