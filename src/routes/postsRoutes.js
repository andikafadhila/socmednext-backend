const express = require("express");
const Router = express.Router();
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");
const {
  getpost,
  postImage,
  deletepost,
  likepost,
  commentpost,
  deletecommentpost,
} = require("../controllers/postsControllers");

const upload = require("../lib/upload");
const uploader = upload("/image", "POSTIMAGE").fields([
  { name: "image", maxCount: 3 },
]);

Router.delete("/delete-post", verifyTokenAccess, deletepost);
Router.get("/get-post", verifyTokenAccess, getpost);
Router.post("/", verifyTokenAccess, uploader, postImage);
Router.post("/like-post", verifyTokenAccess, likepost);
Router.post("/comment-post", verifyTokenAccess, commentpost);
Router.post("/delete-comment-post", verifyTokenAccess, deletecommentpost);

module.exports = Router;
