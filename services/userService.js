const userSignUp = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const postModel = require("../models/PostModel");
const followersModel = require("../models/FollowersModel");
const chatModel = require("../models/ChatModel");
require("dotenv").config();

module.exports = {
  login: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        let userData = await userSignUp.findOne({ email: data.email });
        if (userData) {
          bcrypt.compare(
            data.pasword,
            userData.pasword,
            function (err, results) {
              if (results) {
                let token = jwt.sign(
                  { user_id: userData._id, email: userData.email },
                  process.env.TOKEN_KEY,
                  {
                    expiresIn: "2h",
                  }
                );
                resolve({ user: true, password: true, token, userData });
              } else {
                resolve({ user: true, password: false });
              }
            }
          );
        } else {
          resolve({ user: false });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  signup: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const signupUserExist = await userSignUp
          .findOne({ email: data.email })
          .lean();
        if (signupUserExist) {
          resolve({ exist: true });
        } else {
          data.pasword = await bcrypt.hash(data.pasword, 10);

          userSignUp.create(data).then((response) => {
            let token = jwt.sign(
              { user_id: response._id, email: response.email },
              process.env.TOKEN_KEY,
              {
                expiresIn: "2h",
              }
            );

            response.token = token;
            resolve({ ...response, exist: false });
          });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  Search: (name, neglet) => {
    return new Promise(async (resolve, reject) => {
      try {
        let resultName = await userSignUp
          .find({
            $and: [
              { firstName: new RegExp("^" + name, "i") },
              { _id: { $ne: neglet.user_id } },
            ],
          })
          .lean();

        if (resultName[0]) {
          for (let i = 0; i < resultName.length; i++) {
            let status = await followersModel.findOne({
              user: resultName[i]._id,
              followers: neglet.user_id,
            });
            if (status) {
              resultName[i].status = true;
            } else {
              resultName[i].status = false;
            }
          }
        }

        resolve(resultName);
      } catch (error) {
        reject(error);
      }
    });
  },
  Post: (post) => {
    return new Promise(async (resolve, reject) => {
      try {
        var dateWithoutSecond = new Date();
        let d = dateWithoutSecond.toLocaleTimeString([], {
          year: "numeric",
          month: "numeric",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
        post.dt = d;
        postModel.create(post).then(async (newPost) => {
          await newPost.populate("user");
          newPost.likeStatus = false;
          resolve(newPost);
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  getPosts: (user) => {
    return new Promise(async (resolve, reject) => {
      try {
        let posts = await postModel
          .find()
          .populate("user")
          .populate("comment.user")
          .sort({ createdAt: -1 })
          .lean();
        posts = posts.map((obj) => {
          if (obj.likes) {
            for (let i = 0; i < obj.likes.length; i++) {
              if (obj.likes[i] == user.user_id) {
                obj.likeStatus = true;
                return obj;
              }
            }
            obj.likeStatus = false;
            return obj;
          } else {
            obj.likeStatus = false;
            return obj;
          }
        });
        //console.log(posts[0].comment[0].user.firstName);
        resolve(posts);
      } catch (error) {
        reject(error);
      }
    });
  },
  GiveLike: (data) => {
    return new Promise(async (resolve, reject) => {
      const liked = await postModel
        .findOne({ likes: data.user, _id: data.postId })
        .lean();
      if (!liked) {
        postModel
          .findOneAndUpdate(
            { _id: data.postId },
            { $push: { likes: data.user } }
          )
          .then((response) => {
            resolve({ status: true, likes: response.likes.length + 1 });
          });
      } else {
        postModel
          .findOneAndUpdate(
            { _id: data.postId },
            { $pull: { likes: data.user } }
          )
          .then((response) => {
            resolve({ status: false, likes: response.likes.length - 1 });
          });
      }
    });
  },
  GiveComment: (Comment) => {
    return new Promise((resolve, reject) => {
      postModel
        .updateOne(
          { _id: Comment.id },
          { $push: { comment: { user: Comment.user, text: Comment.comment } } }
        )
        .then((response) => {
          resolve();
        });
    });
  },
  Follow: (body) => {
    return new Promise(async (resolve, reject) => {
      const user = await followersModel.findOne({ user: body.userId }).lean();

      if (user) {
        const following = await followersModel
          .findOne({ user: body.userId, followers: body.user })
          .lean();

        if (!following) {
          followersModel
            .findOneAndUpdate(
              { user: body.userId },
              { $push: { followers: body.user } }
            )
            .then((response) => {
              resolve({ status: true });
            });
        } else {
          followersModel
            .findOneAndUpdate(
              { user: body.userId },
              { $pull: { followers: body.user } }
            )
            .then((response) => {
              resolve({ status: false });
            });
        }
      } else {
        followersModel
          .create({ user: body.userId, followers: body.user })
          .then((response) => {
            resolve({ status: false });
          });
      }
    });
  },
  getFriends: (body) => {
    return new Promise((resolve, reject) => {
      followersModel
        .find({ followers: body.user_id })
        .populate("user")
        .lean()
        .then((response) => {
          resolve(response);
        });
    });
  },
  getChat: (sendUser, toUser) => {
    return new Promise(async (resolve, reject) => {
      let chat = await chatModel
        .findOne({ "from.user": sendUser.user_id, "to.user": toUser })
        .lean();
      //console.log("chat", chat);
      if (!chat) {
        let SecondTry = await chatModel
          .findOne({ "from.user": toUser, "to.user": sendUser.user_id })
          .lean();
        //log("secondtry", SecondTry);
        if (!SecondTry) {
          resolve({ chat: [], room: sendUser.user_id });
        } else {
          resolve({
            chat: SecondTry.to.messages,
           
            room: SecondTry.room,
          });
        }
      } else {
        resolve({
          chat: chat.from.messages,
          
          room: chat.room,
        });
      }
    });
  },
  chatCreate: (sendUser, toUser, messages, to) => {
    return new Promise(async (resolve, reject) => {
      let room;
      let chat = await chatModel
        .findOne({ "from.user": sendUser.user_id, "to.user": toUser })
        .lean();
      if (!chat) {
        let SecondTry = await chatModel
          .findOne({ "from.user": toUser, "to.user": sendUser.user_id })
          .lean();

        if (!SecondTry) {
          chatModel
            .create({
              from: { user: sendUser.user_id, messages: messages },
              to: { user: toUser, messages: [] },
              room: sendUser.user_id,
            })
            .then((response) => {
              resolve({ room: sendUser.user_id });
            });
        } else {
          if (messages[0]) {
            chatModel
              .updateOne(
                { "from.user": toUser, "to.user": sendUser.user_id },
                {
                  $set: { "to.messages": messages, status: "true" },
                  $push: {
                    "from.messages": {
                      $each: [{ gotMessage: to }],
                      $position: 0,
                    },
                  },
                }
              )
              .then((response) => {
                resolve({ room: SecondTry.room });
              });
          } else {
            resolve();
          }
        }
      } else {
        if (messages[0]) {
          console.log(to, "asdfksddk");

          chatModel
            .updateOne(
              { "from.user": sendUser.user_id, "to.user": toUser },
              {
                $set: { "from.messages": messages, status: "true" },
                $push: {
                  "to.messages": { $each: [{ gotMessage: to }], $position: 0 },
                },
              }
            )
            .then((response) => {
              resolve({ room: chat.room });
            });
        } else {
          resolve({ room: sendUser.user_id });
        }
      }
    });
  },
  getUserChat: (body) => {
    return new Promise((resolve, reject) => {
      chatModel
        .find({
          $or: [
            { $and: [{ "from.user": body.user_id }, { status: "true" }] },
            { $and: [{ "to.user": body.user_id }, { status: "true" }] },
          ],
        })
        .populate("from.user")
        .populate("to.user")
        .then((response) => {
          let a = [];
          for (let i = 0; i < response.length; i++) {
            if (response[i].from.user._id == body.user_id) {
              a.push(response[i].to.user);
            } else if (response[i].to.user._id == body.user_id) {
              a.push(response[i].from.user);
            }
          }
          resolve({ chats: a });
        });
    });
  },
  setOnline: (body, status) => {
    return new Promise((resolve, reject) => {
      if (status) {
        userSignUp
          .updateOne({ _id: body.user_id }, { $set: { status: "online" } })
          .then((response) => {
            resolve({ status: "online" });
          });
      } else {
        userSignUp
          .updateOne({ _id: body.user_id }, { $set: { status: "offline" } })
          .then((response) => {
            resolve({ status: "offline" });
          });
      }
    });
  },
};
