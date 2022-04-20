const express = require("express");
const { getpost } = require("../controllers/postsControllers");
const { getUser } = require("../controllers/userControllers");
const Router = express.Router();
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");

Router.get("/get-user", verifyTokenAccess, getUser);

module.exports = Router;
