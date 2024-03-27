const express = require("express");
const router = express.Router();
const WebsitesController = require("../../Controllers/Dashboard/WebsitesController");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            const destinationPath = path.join(
                __dirname,
                "../../Public/Websites"
            );
            // Create the destination directory if it doesn't exist
            if (!fs.existsSync(destinationPath)) {
                fs.mkdirSync(destinationPath, { recursive: true });
            }
            cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
            const uniqueSuffix =
                Date.now() + "-" + Math.round(Math.random() * 1e9);
            const fileExtension = path.extname(file.originalname);
            const generatedFilename = `${uniqueSuffix}${fileExtension}`;
            req.generatedFilename = generatedFilename;
            cb(null, generatedFilename);
        },
    }),
});
router.post(
    "/",
    upload.single("image"),
    (req, res, next) => {
        req.body.generatedFilename = req.generatedFilename;
        next();
    }, 
    WebsitesController.handle_add_Websites
);
router.delete(
    "/:id"
    // WebsitesController.handle_delete_Websites
);
router.put(
    "/:id",
    upload.single("image"),
    (req, res, next) => {
        req.body.generatedFilename = req.generatedFilename;
        next();
    }
    // WebsitesController.handle_update_Websites
);

module.exports = router;
