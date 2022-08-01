const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phoneNumber: Number,
  password: String,
  verified: Boolean,
  regFeePaid: Boolean,
  accountBalance: Number,
});

const User = mongoose.model("User", UserSchema);
module.exports = User;
