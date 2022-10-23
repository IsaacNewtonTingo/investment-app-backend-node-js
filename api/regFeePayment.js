const express = require("express");
const request = require("request");

const router = express.Router();
require("dotenv").config();

const RegFee = require("../models/reg-fee-payments");
const User = require("../models/user");
const ReferralCode = require("../models/referral-codes");

var nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

router.post("/reg-fee-payment", (req, res) => {
  let { userID, phoneNumberUsed, referralCode } = req.body;

  //check if data is received
  if (!userID || !phoneNumberUsed) {
    res.json({
      status: "Failed",
      message: "All fields are required",
    });
  } else {
    //Check if user really exists
    User.find({ phoneNumber: phoneNumberUsed })
      .then((result) => {
        //User not found

        if (result.length <= 0) {
          res.json({
            status: "Failed",
            message: "No user records found. Please signup ",
          });
        } else {
          //User found
          //Check if user has provided referral code
          if (referralCode) {
            //check if referral code is valid
            ReferralCode.find({ referralCode })
              .then((result) => {
                if (result.length > 0) {
                  //Code is valid
                  //calculate the discount

                  const amount = 200 * 0.8;

                  console.log("Discounted payment request made");

                  //perform stk push
                  const url =
                    "https://tinypesa.com/api/v1/express/initialize?https://investment-app-backend.herokuapp.com/payments/registration-callback";
                  request(
                    {
                      url: url,
                      method: "POST",
                      headers: {
                        Apikey: process.env.NEWTON_API_KEY,
                        "Content-Type": "application/x-www-form-urlencoded",
                      },
                      body:
                        "amount=" +
                        amount +
                        "&msisdn=" +
                        phoneNumberUsed +
                        "&account_no=200",
                    },
                    function (error, response, body) {
                      if (error) {
                        console.log(error);
                      } else {
                        res.json({
                          status: "Success",
                          message:
                            "Your request is being processed. {'\n'}Wait for M-Pesa prompt on your phone.",
                        });
                      }
                    }
                  );
                } else {
                  //code is invalid
                  res.json({
                    status: "Failed",
                    message: "The provided referall code is invalid",
                  });
                }
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  status: "Failed",
                  message: "Error occured while verifying referral code",
                });
              });
          } else {
            //No referral code provided
            //Normal amount(200)

            const amount = 1;
            console.log("Non-discounted payment request made");

            //perform stk push
            const url =
              "https://tinypesa.com/api/v1/express/initialize?https://investment-app-backend.herokuapp.com/payments/registration-callback";
            request(
              {
                url: url,
                method: "POST",
                headers: {
                  Apikey: process.env.TINY_PESA_API_KEY_REGISTRATION,
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                body:
                  "amount=" +
                  amount +
                  "&msisdn=" +
                  phoneNumberUsed +
                  "&account_no=200",
              },
              function (error, response, body) {
                if (error) {
                  console.log(error);
                } else {
                  res.json({
                    status: "Success",
                    message:
                      "Your request is being processed. Wait for M-Pesa prompt.",
                  });
                }
              }
            );
          }
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

router.post("/registration-callback", (req, res) => {
  console.log(req.body.Body);

  //Payment is successful
  if (req.body.Body.stkCallback.ResultCode == 0) {
    //pass amount,phoneNumber to this function
    const phoneNumberUsed = req.body.Body.stkCallback.Msisdn;
    const amount = req.body.Body.stkCallback.Amount;

    savePaymentToDB({ phoneNumberUsed, amount });
  } else {
    //Payment unsuccessfull
    console.log("Cacelled");
  }
});

//save reg fee data
const savePaymentToDB = async ({ amount, phoneNumberUsed }) => {
  const newRegFee = new RegFee({
    datePaid: Date.now(),
    amountPaid: amount,
    phoneNumberUsed: phoneNumberUsed,
  });

  await newRegFee
    .save()
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: "newtontingo@gmail.com",
    subject: "Registration fee payment alert",
    html: `<p><strong>${phoneNumberUsed}</strong> has paid <strong>KSH. ${amount}</strong> as registration fee in your investment mobile application</p>`,
  };

  await transporter
    .sendMail(mailOptions)
    .then((response) => {
      console.log(response);
    })
    .catch((err) => {
      console.log(err);
    });
};

//update user reg fee paid status

//Send email to admin that a payment has been done

module.exports = router;
