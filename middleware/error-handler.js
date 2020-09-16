const fs = require("fs");

const errorHandler = (error, req, res, next) => {
  if (req.files) {
    req.files.forEach((file) => fs.unlink(file.path, (err) => console.log(err)));
  }
  if (req.file) {
    fs.unlink(req.file.path, (err) => console.log(err));
  }

  if (res.headerSent) {
    return next(error);
  }
  res
    .status(error.code || 500)
    .json({ message: error.message || "An unknown error occurred!" });
};

module.exports = errorHandler;
