const HttpError = require("../models/HttpError");

module.exports = (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    return next(new HttpError("Not Authorized!", 401));
  }
};
