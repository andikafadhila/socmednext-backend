const express = require("express");
const fileUpload = require("../lib/fileUpload");
const Router = express.Router();
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");
const {
  updateBio,
  updateProfilePicture,
} = require("../controllers/editControllers");

Router.put("/update-bio", verifyTokenAccess, updateBio);
Router.put("/update-profile", fileUpload.single("file"), verifyTokenAccess);

module.exports = Router;
