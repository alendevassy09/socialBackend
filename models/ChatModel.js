const mongoose = require("mongoose");
let schema = mongoose.Schema;
const Model = schema(
  {
    from: {
      status:String,
      user: {
        type: schema.Types.ObjectId,
        ref: "users",
      },
      messages: [
        { 
            gotMessage: {
            message: { type: String, trim: true },
            author: String,
            room: String,
            time: String,
          },
          sendMessage: {
            message: { type: String, trim: true },
            author: String,
            room: String,
            time: String,
          },
        },
      ],
      
    },
    to: {
      status:String,
      user: {
        type: schema.Types.ObjectId,
        ref: "users",
      },
      messages: [
        { 
            gotMessage: {
            message: { type: String, trim: true },
            author: String,
            room: String,
            time: String,
          },
          sendMessage: {
            message: { type: String, trim: true },
            author: String,
            room: String,
            time: String,
          }
        },
      ],
      
    },
    status:String,
    room: { type: schema.Types.ObjectId, ref: "users" },
  },
  {
    timestamps: true,
  }
);

const ChatModel = mongoose.model("chats", Model);
module.exports = ChatModel;
