const mongoose = require("mongoose");
const { create } = require("./User");

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    required: true,
    default: Date.now(),
    expires: 5 * 60,
  },
});

//a function => to send email
async function sendVerificationEmail(email, otp) {
  try {
    const mailResponse = await mailSender(
      email,
      "Email Verification from StudyNotion",
      otp
    );
    console.log("Email sent successfully " + mailResponse);
  } catch (err) {
    console.log("error occured while sendng mails: " + err);
    throw err;
  }
}

OTPSchema.pre("save", async function (next) {
  await sendVerificationEmail(this.email, this.otp);
  next();
});

module.exports = mongoose.model("OTP", OTPSchema);
