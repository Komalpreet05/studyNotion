const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt");

//resetPasswordToken
exports.resetPasswordToken = async (req, res) => {
  try {
    //get email from req body
    const email = req.body.email;
    //check user for this email
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email is not registered",
      });
    }
    //if email is ok, generate token using crypto
    const token = crypto.randomUUID();
    //update user by adding token and expiration time
    const updatedDetails = await User.findOneAndUpdate(
      { email: email },
      {
        token: token,
        resetPasswordExpires: Date.now() + 5 * 60 * 1000,
      },
      { new: true }
    );
    //create url
    const url = `http://localhost:3000/update-password/${token}`;
    //send mail containing url, and return response
    await mailSender(
      email,
      "Passoword Reset Instructions",
      `Password reset link: ${url}`
    );
    return res.status(200).json({
      success: true,
      message: "check email and reset password",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "Something went wrong, try again later",
    });
  }
};
//resetPassword

exports.resetPassword = async (req, res) => {
  try {
    //get user data from body
    //note: in frontend we put our data in the req to send at backend
    const { token, password, confirmPassword } = req.body;
    //validation
    if (password !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "Password do not match",
      });
    }
    //get user details from db using token
    const userDetails = await User.findOne({ token: token });
    //if no entry -  invalid token
    if (!userDetails) {
      return res.status(401).json({
        success: false,
        message: "Token is invalid",
      });
    }
    //token time check
    if (userDetails.resetPasswordExpires < Date.now()) {
      return res.status(401).json({
        success: false,
        message: "Token is expired, please regenerate your token",
      });
    }
    //password hash
    const hashedPassword = await bcrypt.hash(password, 10);

    //update in db
    await User.findOneAndUpdate(
      { token: token },
      { password: hashedPassword },
      { new: true }
    );

    return res.status(200).json({
      success: true,
      message: "password updated successfully",
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "something went wrong",
    });
  }
};
