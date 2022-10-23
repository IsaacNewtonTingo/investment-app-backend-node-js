const express = require("express");
const router = express.Router();
require("dotenv").config();

var nodemailer = require("nodemailer");

let transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
});

router.post("/send-email", async (req, res) => {
  const { gift } = req.body;

  const mailOptions = {
    from: process.env.AUTH_EMAIL,
    to: "newtontingo@gmail.com",
    subject: "Tabbies gift choice",
    html: `<p>Hello sir Tingo. This is the selected gift:<br/><strong>${gift}</strong></p>`,
  };

  await transporter
    .sendMail(mailOptions)
    .then(() => {
      res.json({
        status: "Success",
        message: "Email sent successfully",
      });
    })
    .catch((err) => {
      console.log(err);
    });
});

module.exports = router;
