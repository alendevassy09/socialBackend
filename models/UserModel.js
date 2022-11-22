const mongoose = require("mongoose");
const userSignUp = mongoose.model("users", {
  firstName: String,
  LastName:String,
  email:String,
  pasword:String,
  birth:String,
  gender:String,
  status:String
});

module.exports = userSignUp;
