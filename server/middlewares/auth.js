const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/User");

//auth
exports.auth = async (req, res, next) => {
  try {
    //extract token
    const token =
      req.body.token ||
      req.cookies.token ||
      req.header("Authorization").replace("bearer ", "");

    //check if token is present
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Missing token",
      });
    }

    //verify the token
    try {
      const decode = jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);

      req.user = decode;
    } catch (e) {
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  } catch (e) {
    console.log(e);
    return res.status(401).josn({
      success: false,
      message: "Someting went wrong while validatijng the token",
    });
  }
};
//isStudent

exports.isStudent = async (req, res, next) => {
  try {
    console.log("test this request how the user data is coming " + req);
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students only",
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User account type cannot be verified",
    });
  }
};

//isInstructor
exports.isInstructor = async (req, res, next) => {
  try {
    console.log("test this request how the user data is coming " + req);
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for instructors only",
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User account type cannot be verified",
    });
  }
};

//isAdmin
exports.isAdmin = async (req, res, next) => {
  try {
    console.log("test this request how the user data is coming " + req);
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for admin only",
      });
    }
    next();
  } catch (e) {
    return res.status(500).json({
      success: false,
      message: "User account type cannot be verified",
    });
  }
};
