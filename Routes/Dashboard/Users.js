const express = require("express");
const router = express.Router();
const UsersConroller = require("../../Controllers/Dashboard/UsersController");
router.post("/", UsersConroller.handle_add_User);
router.post("/:id/Notify", UsersConroller.handle_notify_User);
router.delete("/:id", UsersConroller.handle_delete_User);

router.put("/", UsersConroller.handle_modify_User);
router.get("/", UsersConroller.getAllUsers);
router.get("/:id", UsersConroller.get_user);
router.get("/:id/Courses/Requests", UsersConroller.get_user_course_requests);
router.get("/:id/Services/Requests", UsersConroller.get_user_service_requests);
router.delete("/:id/Courses/:course_id", UsersConroller.delete_user_course);
router.delete("/:id/Services/:service_id", UsersConroller.delete_user_service);
module.exports = router;
