const express = require("express");
const Router = express.Router();
const { register } = require("../controllers/authControllers");
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");

Router.post("/register", register);
// Router.post("/login", login);
Router.get("/keeplogin", verifyTokenAccess);
Router.get("/verified", verifyTokenEmail);
// Router.post("/sendemail-verified", sendEmailVerified);

module.exports = Router;
