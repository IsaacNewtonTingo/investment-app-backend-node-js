const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReferralCodesSchema = new Schema({
  userID: String,
  referralCode: String,
});

const ReferralCode = mongoose.model("ReferralCode", ReferralCodesSchema);
module.exports = ReferralCode;
