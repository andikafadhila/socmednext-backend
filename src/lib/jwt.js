const jwt = require("jsonwebtoken");

const createJwtAccess = (data) => {
  //   access token
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1 days" });
};
const createJwtemail = (data) => {
  //   email token
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "1 days" });
};

module.exports = {
  createJwtAccess,
  createJwtemail,
};
