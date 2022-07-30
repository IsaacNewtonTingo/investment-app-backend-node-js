const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RegFeePaymentSchema = new Schema({
  userID: String,
  phoneNumberUsed: Number,
  amountPaid: Number,
  datePaid: Date,
});

const RegFee = mongoose.model("RegFee", RegFeePaymentSchema);
module.exports = RegFee;
