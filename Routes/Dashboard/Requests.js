const express = require("express");
const router = express.Router();
const RequestsController = require("../../Controllers/Dashboard/RequestsController");

router.get("/", RequestsController.handle_get_Requests_Request);
router.post("/Accept", RequestsController.handle_Accept_Request_request);
router.post("/Reject", RequestsController.handle_Reject_Request_request);

module.exports = router;
