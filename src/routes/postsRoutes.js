const express = require("express");
const Router = express.Router();
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");
const {
  posting,
  getpost,
  postImage,
  deletepost,
} = require("../controllers/postsControllers");

const upload = require("../lib/upload");
const uploader = upload("/image", "POSTIMAGE").fields([
  { name: "image", maxCount: 3 },
]);

Router.post("/posting", verifyTokenAccess, posting);
Router.delete("/delete-post", verifyTokenAccess, deletepost);
Router.get("/get-post", getpost);
Router.post("/", verifyTokenAccess, uploader, postImage);

module.exports = Router;
