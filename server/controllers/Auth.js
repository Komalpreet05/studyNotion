const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

//sendOTP
exports.sendOTP = async (req, res) => {
  try {
    //fetch email from req body
    const { email } = req.body;

    //check if user already exist
    const checkUserPresent = await User.findOne({ email });

    //user exists, then return response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already registered",
      });
    }

    //generate OTP
    let otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });

    console.log("generated otp ", otp);

    //make sure generated otp is unique
    let result = await OTP.findOne({ otp: otp });
    while (result) {
      otp = otpGenerator.generate(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = {
      email,
      otp,
    };

    //create an entry in db
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    //return response
    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

//signup

exports.signUp = async (req, res) => {
  try {
    //data fetch from body req
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,

      otp,
    } = req.body;
    //validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "all fields are required",
      });
    }

    //match both passowrds
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "passwords do not match",
      });
    }

    //check user already exists or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }

    //find most recent otp for the user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    //validate otp
    if (recentOtp.length == 0) {
      return res.status(400).json({
        success: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp.otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    //if matched otp, hash password,
    const hashedPassword = await bcrypt.hash(password, 10);
    //create DB entry
    const profileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: profileDetails._id,
      image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    //return response
    res.status(200).json({
      success: true,
      message: "User is registered successfully",
      user,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({
      success: false,
      message: "User cannot be registered, please try again later",
    });
  }
};

//login

exports.login = async (req, res) => {
  try {
    //get data from body
    const { email, password } = req.body;
    //validate data
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "all fields are required",
      });
    }

    //check email if exists
    const userExist = await User.findOne({ email })
      .populate("additionalDetails")
      .exec();

    if (!userExist) {
      return res.status(401).json({
        success: false,
        message: "User does not exists",
      });
    }

    //check passowrd if matches with db
    //generate JWT
    if (await bcrypt.compare(password, userExist.password)) {
      const payload = {
        email: userExist.email,
        id: userExist._id,
        accountType: userExist.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      let userObj = userExist.toObject();
      userObj.token = token;
      userObj.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      //create cookie and send response
      res.cookie("token", token, options).status(200).json({
        success: true,
        message: "User logged in successfully",
        token,
        user: userObj,
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      success: false,
      message: "User cannot be logged in, please try again later",
    });
  }
};
//changepassword

exports.changePassword = async (req, res) => {
  // data from req body - old password, new password, confirm new password
  //validations
  //update password in db
  //send mail - password update
  //return response
};
