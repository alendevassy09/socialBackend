const mongoose = require("mongoose");
let schema = mongoose.Schema;
const Model = schema(
  {
    user: {
      type: schema.Types.ObjectId,
      ref: "users",
    },

    storyId: [String],
    description: String,
    seen:[String],
    likes: [
      {
        type: schema.Types.ObjectId,
        ref: "users",
      },
    ],
    dt: String,
    comment: [
      {
        user: {
          type: schema.Types.ObjectId,
          ref: "users",
        },
        text: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const statusModel = mongoose.model("stories", Model);
module.exports = statusModel;
