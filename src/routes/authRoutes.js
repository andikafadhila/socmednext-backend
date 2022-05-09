const express = require("express");

const {
  getusername,
  getemail,
  sendEmailForgetPassword,
  resetPassword,
  getUserData,
} = require("../controllers/authControllers");
const { verifyTokenAccess, verifyTokenEmail } = require("../lib/verifyToken");
const Router = express.Router();
const { authControllers } = require("./../controllers");
const { register, login, keeplogin, sendEmailVerified, accountVerified } =
  authControllers;
const verifyLastToken = require("./../lib/verifylastToken");

Router.post("/register", register);
Router.post("/login", login);
Router.post("/getusername", getusername);
Router.post("/getemail", getemail);
Router.get("/keeplogin", verifyTokenAccess, keeplogin);
Router.get("/verified", verifyTokenEmail, verifyLastToken, accountVerified);
Router.post("/sendemail-verified", sendEmailVerified);
Router.post("/sendemail-forgetpassword", sendEmailForgetPassword);
Router.get("/reset-password", verifyTokenEmail, getUserData);
Router.post("/newpassword", verifyTokenEmail, resetPassword);

module.exports = Router;
