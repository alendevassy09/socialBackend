const mongoose = require("mongoose");
let schema = mongoose.Schema;
const Model = schema(
  {
    user: {
      type: schema.Types.ObjectId,
      ref: "users",
    },

    postId: String,
    description: String,
    likes: [
      {
        type: schema.Types.ObjectId,
        ref: "users",
      },
    ],
    dt: String,
    likeStatus: {
      type: Boolean,
      default: false,
    },
    comment: [
      {
        user: {
          type: schema.Types.ObjectId,
          ref: "users",
        },
        text: String,
      },
    ],
    report: { default: false, type: Boolean },
    reports:[
      {
        type: schema.Types.ObjectId,
        ref: "users",
      }
    ],
    reportPost:false
  },
  {
    timestamps: true,
  }
);

const postModel = mongoose.model("posts", Model);
module.exports = postModel;
