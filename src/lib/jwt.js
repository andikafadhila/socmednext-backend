const jwt = require("jsonwebtoken");

const createJwtAccess = (data) => {
  //   access token
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "2h" });
};
const createJwtemail = (data) => {
  //   email token
  return jwt.sign(data, process.env.JWT_SECRET, { expiresIn: "5m" });
};

module.exports = {
  createJwtAccess,
  createJwtemail,
};
