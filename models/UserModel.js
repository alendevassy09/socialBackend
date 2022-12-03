const mongoose = require("mongoose");
const userSignUp = mongoose.model(
  "users",
  {
    firstName: String,
    LastName: String,
    email: String,
    pasword: String,
    birth: String,
    gender: String,
    status: String,
    profile: { type: String, default: "profile_pic/tyye6ctzdt8c9qqhegdj" },
    cover: { type: String, default: "profile_pic/tyye6ctzdt8c9qqhegdj" },
    worksAt: { type: String, default: "" },
    liveAt: { type: String, default: "" },
    studiedAt: { type: String, default: "" },
  }
);

module.exports = userSignUp;
