const express = require("express");
const router = express.Router();
const RequestsController = require("../../Controllers/Dashboard/RequestsController");

router.get("/", RequestsController.handle_get_Requests);
router.post("/Accept", RequestsController.handle_Accept_request);
router.post("/Reject", RequestsController.handle_Reject_request);
router.get("/:userId", RequestsController.handle_get_user_Requests);

module.exports = router;
