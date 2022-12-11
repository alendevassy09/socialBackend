const mongoose = require("mongoose");
let schema = mongoose.Schema;
const Model = schema(
  {
    postId:{
      type: schema.Types.ObjectId,
      ref: "posts",
    },
    count:Number,
    type1:{
      type:Boolean,
      default:false
    },
    type2:{
      type:Boolean,
      default:false
    },
    type3:{
      type:Boolean,
      default:false
    },
    type4:{
      type:Boolean,
      default:false
    },
  },
  {
    timestamps: true,
  }
);

const report = mongoose.model("reports", Model);
module.exports = report;
