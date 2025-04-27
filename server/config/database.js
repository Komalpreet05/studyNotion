const mongoose = require("mongoose");
require("dotenv").config();

exports.connect = () => {
  mongoose
    .connect(process.env.MONGODB_URL)
    .then(() => console.log("Mongo DB Connected"))
    .catch((err) => {
      console.log("Mongo DB Connection Failed");
      console.log(err);
      process.exit(1);
    });
};
