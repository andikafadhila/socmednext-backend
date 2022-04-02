// encrypsi by crypto nodejs
const crypto = require("crypto");

const hashPass = (password) => {
  let hashing = crypto
    .createHmac("sha256", "thisissparta")
    .update(password)
    .digest("hex");
  return hashing;
};

module.exports = hashPass;
