const express = require("express");
const Router = express.Router();
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");
const { posting } = require("../controllers/postsControllers");

Router.post("/posting", verifyTokenAccess, posting);

module.exports = Router;
