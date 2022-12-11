const mongoose = require("mongoose");
const adminModel = mongoose.model(
  "admins",
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
    locationAt: { type: String, default: "" },
    webPage: { type: String, default: "" },
    token:{ type: String, default: "" }
  }
);

module.exports = adminModel;
