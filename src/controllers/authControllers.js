const { createJwtAccess, createJwtemail } = require("../lib/jwt");
const { registerService } = require("../services/authService");
const { dbCon } = require("./../connections");
const transporter = require("./../lib/transporter");
const handlebars = require("handlebars");
const myCache = require("./../lib/cache");
const path = require("path");
const fs = require("fs");

// register
const register = async (req, res) => {
  try {
    const {
      success,
      data: userData,
      message,
    } = await registerService(req.body);

    // let timeCreated = new Date().now();

    const dataToken = {
      id: userData.id,
      username: userData.username,
      // timeCreated,
    };

    let cached = myCache.set(userData.id, dataToken, 5 * 60);
    if (!cached) {
      throw { message: "error caching" };
    }

    const tokenAccess = createJwtAccess(dataToken);
    const tokenEmail = createJwtemail(dataToken);

    const host =
      process.env.NODE_ENV === "production"
        ? "http://namadomainfe"
        : "http://localhost:3000";
    const link = `${host}/verified/${tokenEmail}`;

    let htmlString = fs.readFileSync(filepath, "utf-8");

    const template = handlebars.compile(htmlString);
    const htmlToEmail = template({
      username: userData.username,
      link,
    });

    transporter.sendMail({
      from: "PhotoLab <andikarfadhila@gmail.com>",
      to: userData.email,
      subject: "please click the link to verified your account",
      html: htmlToEmail,
    });
    res.set("x-token-access", tokenAccess);
    return res.status(200).send(userData);
  } catch (error) {
    return res.status(500).send({ message: error.message || error });
  }
  res.set("x-token-access", tokenAccess);
  return res.status(200).send(userData);
};
// register

// log in
// log in

// keep log in
// keep log in

// account Verified
// account Verified

// send Email Verified
// send Email Verified

module.exports = {
  register,
};
