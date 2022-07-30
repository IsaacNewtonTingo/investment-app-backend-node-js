const express = require("express");
const router = express.Router();

require("dotenv").config();

const ReferralCode = require("../models/referral-codes");

router.post("/add-referral-code", (req, res) => {
  const { referralCode, userID } = req.body;

  if (referralCode == "") {
    res.json({
      status: "Failed",
      message: "Referral code is missing",
    });
  } else {
    const newReferralCode = new ReferralCode({
      referralCode: referralCode,
      userID: userID,
    });

    newReferralCode
      .save()
      .then((response) => {
        res.json({
          status: "Success",
          message: {
            message: "Referral code successfully saved",
            referralCode: response.referralCode,
          },
        });
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message: "Error occured while saving referral code",
        });
      });
  }
});

module.exports = router;
