const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const InvestmentPaymentSchema = new Schema({
  phoneNumber: Number,
  userID: String,
  amountInvested: Number,
  investedOn: Date,
  maturesOn: Date,
  returnOnInvestment: Number,
});

const InvestmentPayment = mongoose.model(
  "InvestmentPayment",
  InvestmentPaymentSchema
);
module.exports = InvestmentPayment;
