const express = require("express");
const router = express.Router();
const Add_Admin_Controller = require("../../Controllers/Dashboard/Add_AdminController");

router.post("/", Add_Admin_Controller.addAdmin);

module.exports = router;
