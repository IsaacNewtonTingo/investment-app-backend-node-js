const express = require("express");
const User = require("../models/user");
const router = express.Router();

router.post("/account-balance", async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    res.json({
      status: "Failed",
      message: "Phone number is missing",
    });
  } else {
    await User.find({ phoneNumber })
      .then((response) => {
        if (response.length > 0) {
          //user exists
          res.json({
            status: "Success",
            message: "User records found",
            data: response,
          });
        } else {
          //user not found
          res.json({
            status: "Failed",
            message: "No user records found",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message: "Error occured while checking user records",
        });
      });
  }
});

module.exports = router;
