const express = require("express");
const router = express.Router();

const request = require("request");

const User = require("../models/user");

require("dotenv").config();

var nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

router.post("/deposit-funds", async (req, res) => {
  const { amount, phoneNumber } = req.body;

  if (!amount) {
    res.json({
      status: "Failed",
      message: "Please input amount",
    });
  } else if (!phoneNumber) {
    res.json({
      status: "Failed",
      message: "Please input phone number",
    });
  } else {
    await User.find({ phoneNumber })
      .then((response) => {
        if (response.length > 0) {
          //user found
          const url =
            "https://tinypesa.com/api/v1/express/initialize?https://investment-app-backend.herokuapp.com/payments/deposit-callback";
          request(
            {
              url: url,
              method: "POST",
              headers: {
                Apikey: process.env.TINY_PESA_API_KEY_DEPOSIT,
                "Content-Type": "application/x-www-form-urlencoded",
              },
              body:
                "amount=" +
                amount +
                "&msisdn=" +
                phoneNumber +
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
        } else {
          //user not found
          res.json({
            status: "Failed",
            message: "User not found. Records might have been deleted",
          });
        }
      })
      .catch((err) => {
        console.log(err);
        res.json({
          status: "Failed",
          message: "Error occured while checking user status",
        });
      });
  }
});

router.post("/deposit-callback", (req, res) => {
  console.log(req.body.Body);

  //Payment is successful
  if (req.body.Body.stkCallback.ResultCode == 0) {
    //pass amount,phoneNumber to this function
    const phoneNumber = req.body.Body.stkCallback.Msisdn;
    const amount = req.body.Body.stkCallback.Amount;

    updateAccountStatus({ phoneNumber, amount });
  } else {
    //Payment unsuccessfull
    console.log("Transaction cacelled");
  }
});

//save deposit funds data
const updateAccountStatus = async ({ amount, phoneNumber }) => {
  await User.find({ phoneNumber })
    .then(async (response) => {
      if (response.length > 0) {
        //user found
        const accountBalance = response[0].accountBalance;
        await User.updateOne(
          { phoneNumber: phoneNumber },
          { accountBalance: amount + accountBalance }
        )
          .then(async (response) => {
            console.log(response);
            console.log("---------------------saved-------------------");

            const mailOptions = {
              from: process.env.AUTH_EMAIL,
              to: "newtontingo@gmail.com",
              subject: "Funds deposit alert",
              html: `<p><strong>${phoneNumber}</strong> has deposited <strong>KSH. ${amount}</strong> in your investment mobile application</p>`,
            };

            await transporter
              .sendMail(mailOptions)
              .then((response) => {
                console.log(response);
              })
              .catch((err) => {
                console.log(err);
              });
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        //user not found
        console.log("User not found");
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = router;
