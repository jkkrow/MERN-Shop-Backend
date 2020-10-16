const express = require("express");
const connectDB = require("./config/db");

const authRoute = require("./routes/auth-routes");
const userRoute = require("./routes/user-routes");
const sellerRoute = require("./routes/seller-routes");
const errorHandler = require("./middleware/error-handler");
const HttpError = require("./models/HttpError");

// Connect Database
connectDB();

const app = express();

app.use(express.json());
app.use("/images", express.static("images"));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/seller", sellerRoute);

// Paypal config
app.get("/api/config/paypal", (req, res, next) =>
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID })
);

app.use((req, res, next) => {
  throw new HttpError("Could not find this route", 404);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in port ${PORT}`));
