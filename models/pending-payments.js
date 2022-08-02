const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PendingPaymentsSchema = new Schema({
  userID: String,
  phoneNumber: Number,
  amount: Number,
  dateRequested: Date,
});

const PendingPayment = mongoose.model("PendingPayment", PendingPaymentsSchema);
module.exports = PendingPayment;
