const express = require("express");
const Router = express.Router();
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");
const {
  updateBio,
  updateProfilePicture,
  getusernameexceptuser,
  deleteProfilePicture,
} = require("../controllers/editControllers");

const upload = require("../lib/upload");

Router.post("/getuserbyid", getusernameexceptuser);
Router.put("/update-bio", verifyTokenAccess, updateBio);
Router.put(
  "/",
  upload("/avatar", "AVATAR").single("avatar"),
  verifyTokenAccess,
  updateProfilePicture
);
Router.put("/delete-avatar", verifyTokenAccess, deleteProfilePicture);

module.exports = Router;
