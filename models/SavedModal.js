const mongoose = require("mongoose");
let schema = mongoose.Schema;
const Model = schema(
  {
    user: {
      type: schema.Types.ObjectId,
      ref: "users",
    },
    posts: [
      {
        type: schema.Types.ObjectId,
        ref: "posts",
      },
    ]
  },
  {
    timestamps: true,
  }
);

const saved = mongoose.model("saves", Model);
module.exports = saved;
