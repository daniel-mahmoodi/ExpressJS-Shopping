const jwt = require("jsonwebtoken");
module.exports = (req, res, next) => {
  const token = req.headers?.authorization?.split(" ")[1];
  try {
    jwt.verify(token, process.env.SECRET_KEY);
    next();
  } catch (error) {
    res.status(401).send(error.message);
  }
};
