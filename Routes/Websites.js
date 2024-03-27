const express = require("express");
const router = express.Router();
const WebsitesController = require("../Controllers/WebsitesController");

router.get("/", WebsitesController.get_All_Websites);
// router.get("/categories", WebsitesController.getAllCategorys);
router.get("/categories/:category", WebsitesController.getWebsiteByCategory);
// router.get("/filter", WebsitesController.FilterWebsites);
router.get("/search/:search", WebsitesController.searchWebsite);
router.get("/:WebsiteId", WebsitesController.getWebsite);
module.exports = router;
