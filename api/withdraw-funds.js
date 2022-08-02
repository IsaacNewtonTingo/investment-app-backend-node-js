const express = require("express");
const router = express.Router();

const PendingPayment = require("../models/pending-payments");
const User = require("../models/user");

var nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

router.post("/withdraw-funds", async (req, res) => {
  const { phoneNumber, amount, userID } = req.body;

  await User.find({ phoneNumber }).then(async (response) => {
    if (response.length > 0) {
      const currentBalance = response[0].accountBalance;
      //user found
      if (response[0].accountBalance >= amount) {
        await User.updateOne(
          { phoneNumber: phoneNumber },
          { accountBalance: currentBalance - amount }
        )
          .then(async () => {
            const newPendingPayment = new PendingPayment({
              userID: userID,
              phoneNumber: phoneNumber,
              amount: amount,
              dateRequested: Date.now(),
            });

            await newPendingPayment
              .save()
              .then(() => {
                res.json({
                  status: "Success",
                  message:
                    "Your withdrawal request has been recieved and will be processed in the next 5-7Days",
                });
              })
              .catch((err) => {
                console.log(err);
                res.json({
                  status: "Failed",
                  message:
                    "Error occured while processing your withdrawal request",
                });
              })
              .finally(async () => {
                const mailOptions = {
                  from: process.env.AUTH_EMAIL,
                  to: "newtontingo@gmail.com",
                  subject: "Withrawal request alert",
                  html: `<p><strong>${phoneNumber}</strong> has requested to withraw <strong>KSH. ${amount}</strong> in your investment mobile application</p>`,
                };

                await transporter
                  .sendMail(mailOptions)
                  .then((response) => {
                    console.log(response);
                  })
                  .catch((err) => {
                    console.log(err);
                  });
              });
          })
          .catch((err) => {
            console.log(err);
            res.json({
              status: "Failed",
              message: "Error occured while processing your withdrawal request",
            });
          });
      } else {
        res.json({
          status: "Failed",
          message: "You don't have enough funds. Try a lower amount",
        });
      }
    } else {
      res.json({
        status: "Failed",
        message: "User not found",
      });
    }
  });
});

module.exports = router;
