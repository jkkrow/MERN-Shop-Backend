const express = require("express");
const cors = require("cors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v1: uuidv1 } = require("uuid");

const connectDB = require("./config/db");
const authRoute = require("./routes/auth-routes");
const userRoute = require("./routes/user-routes");
const adminRoute = require("./routes/admin-routes");
const errorHandler = require("./middleware/error-handler");
const HttpError = require("./models/HttpError");

// Connect Database
connectDB();

const app = express();

app.use(express.json());
app.use("/images", express.static("images"));
app.use(cors());

// Routes
app.use("/api/auth", authRoute);
app.use("/api/user", userRoute);
app.use("/api/admin", adminRoute);

// Paypal config
app.get("/api/config/paypal", (req, res, next) =>
  res.json({ clientId: process.env.PAYPAL_CLIENT_ID })
);

// Stripe config
app.post("/api/config/stripe", async (req, res, next) => {
  const { totalPrice, token } = req.body;

  const idempotencyKey = uuidv1();

  const customer = await stripe.customers.create({
    email: token.email,
    source: token.id,
  });

  const result = await stripe.charges.create(
    {
      amount: Math.round(totalPrice * 100),
      currency: "usd",
      customer: customer.id,
      receipt_email: token.email,
    },
    { idempotencyKey }
  );

  res.json({ result });
});

app.use((req, res, next) => {
  throw new HttpError("Could not find this route", 404);
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server running in port ${PORT}`));
