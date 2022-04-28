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
  cek,
  editcomment,
  getPostById,
} = require("../controllers/postsControllers");

const upload = require("../lib/upload");
const uploader = upload("/image", "POSTIMAGE").fields([
  { name: "image", maxCount: 3 },
]);

Router.delete("/delete-post", verifyTokenAccess, deletepost);
Router.get("/get-post", verifyTokenAccess, getpost);
Router.get("/get-post-byId", verifyTokenAccess, getPostById);
Router.post("/", verifyTokenAccess, uploader, postImage);
Router.post("/like-post", verifyTokenAccess, likepost);
Router.post("/comment-post", verifyTokenAccess, commentpost);
Router.delete("/delete-comment-post", verifyTokenAccess, deletecommentpost);
Router.delete("/delete-post", verifyTokenAccess, deletepost);
Router.get("/cek", verifyTokenAccess, cek);
Router.patch("/edit-comment", verifyTokenAccess, editcomment);
Router.patch("/edit-post", verifyTokenAccess, editcomment);

module.exports = Router;
