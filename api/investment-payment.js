const express = require("express");
const router = express.Router();

require("dotenv").config();

const InvestmentPayment = require("../models/investment-payments");
const User = require("../models/user");

var nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

router.post("/investment-payment", async (req, res) => {
  const { phoneNumber, userID, amountInvested } = req.body;

  if (!phoneNumber || !amountInvested || !userID) {
    res.json({
      status: "Failed",
      message: "Phone number / userID / amount is missing",
    });
  } else {
    await User.find({ phoneNumber })
      .then(async (response) => {
        if (response.length > 0) {
          //user exists
          //check the balance
          if (response[0].accountBalance >= amountInvested) {
            //if enough funds, do deduction
            //update balance in User model
            const accountBalance = response[0].accountBalance;
            await User.updateOne(
              { phoneNumber: phoneNumber },
              { accountBalance: accountBalance - amountInvested }
            )
              .then((response) => {
                console.log(response);
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  status: "Failed",
                  message: "Error occured while updating account balance",
                });
              });

            //save investment details
            const newInvestment = new InvestmentPayment({
              userID: userID,
              phoneNumber: phoneNumber,
              amountInvested: amountInvested,
              investedOn: Date.now(),
              maturesOn: Date.now() + 604800000,
              returnOnInvestment: amountInvested * 0.03 + amountInvested,
            });

            await newInvestment
              .save()
              .then((response) => {
                res.json({
                  status: "Success",
                  message: "Successfully invested",
                  data: response,
                });
              })
              .finally(async () => {
                const mailOptions = {
                  from: process.env.AUTH_EMAIL,
                  to: "newtontingo@gmail.com",
                  subject: "Investment payment alert",
                  html: `<p><strong>${phoneNumber}</strong> has paid <strong>KSH. ${amountInvested}</strong> as Investment fee in your investment mobile application</p>`,
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
                res.json({
                  status: "Failed",
                  message: "Error occured while saving investment details",
                });
              });
          } else {
            //funds not enough
            res.json({
              status: "Failed",
              message: "You have insufficient funds. Please deposit.",
            });
          }
        } else {
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
          message: "Error occured while checking user status",
        });
      });
  }
});

module.exports = router;
