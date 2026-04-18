const SECRET_KEY = process.env.JWT_SECRET || "dev_secret_change_me";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

module.exports = {
  SECRET_KEY,
  JWT_EXPIRES_IN,
};
