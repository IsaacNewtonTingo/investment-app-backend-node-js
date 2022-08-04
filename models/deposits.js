const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const DepositsSchema = new Schema({
  phoneNumber: Number,
  amountDeposited: Number,
  dateDeposited: Date,
});

const Deposit = mongoose.model("Deposit", DepositsSchema);
module.exports = Deposit;
