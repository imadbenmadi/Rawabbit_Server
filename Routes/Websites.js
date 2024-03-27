const express = require("express");
const router = express.Router();
const WebsitesController = require("../Controllers/WebsitesController");

router.get(
    "/",
    WebsitesController.get_All_Websites
);

module.exports = router;
