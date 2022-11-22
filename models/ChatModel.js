const mongoose = require("mongoose");
let schema = mongoose.Schema;
const Model = schema(
  {
    from: {
      user: {
        type: schema.Types.ObjectId,
        ref: "users",
      },
      messages: [
        { 
            gotMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
          sendMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
        },
      ],
      unread:[
        { 
            gotMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
          sendMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
        },
      ]
    },
    to: {
      user: {
        type: schema.Types.ObjectId,
        ref: "users",
      },
      messages: [
        { 
            gotMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
          sendMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
        },
      ],
      unread:[
        { 
            gotMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
          sendMessage: {
            message: String,
            author: String,
            room: String,
            time: String,
          },
        },
      ]
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
