const express = require("express");
const bodyParser = require("body-parser").json;
const cors = require("cors");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser());

require("./config/db");
app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

const UserRouter = require("./api/user");
const RegFeePaymentRouter = require("./api/regFeePayment");
const ReferralCodeRouter = require("./api/referral-code");
const InvestmentPaymentRouter = require("./api/investment-payment");
const DepositFundsRouter = require("./api/deposit-funds");
const WithdrawalRouter = require("./api/withdraw-funds");
const UserDataRouter = require("./api/user-data");
const BirthdayGiftEmailDeliveryRouter = require("./api/email-delivery");

app.use("/user", UserRouter);
app.use("/user/user-data", UserDataRouter);
app.use(
  "/payments",
  DepositFundsRouter,
  RegFeePaymentRouter,
  InvestmentPaymentRouter,
  WithdrawalRouter
);
app.use("/referrals", ReferralCodeRouter);
app.use("/birthday-gift-email", BirthdayGiftEmailDeliveryRouter);
