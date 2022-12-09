const userSignUp = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const postModel = require("../models/PostModel");
const followersModel = require("../models/FollowersModel");
const chatModel = require("../models/ChatModel");
const statusModel = require("../models/StatusModel");
const save = require("../models/SavedModal");
const nodemailer = require("nodemailer");
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
  PasswordUpdate: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
        body.password = await bcrypt.hash(body.password, 10);
        userSignUp
          .updateOne(
            { email: body.email },
            { $set: { pasword: body.password } }
          )
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  sendEmail: (email) => {
    return new Promise((resolve, reject) => {
      let code = Math.floor(100000 + Math.random() * 900000);
      let userMessages = "This Is Your 6 Digit Secret Code :" + code;

      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: "alendevassy08@gmail.com",
          pass: "hbkufaiyttxkjjxp",
        },
      });
      let messages = {
        from: "alendevassy08@gmail.com", // sender address
        to: email, // list of receivers
        subject: "verification code", // Subject line
        text: userMessages, // plain text body
      };
      transporter.sendMail(messages, (err, info) => {
        if (err) {
          console.log("an error occured", err);
          resolve({ status: true });
        } else {
          console.log("no error hahaha 😈😈😈");
          resolve({ status: false, code });
        }
      });
    });
  },
  googleSignUp: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        const signupUserExist = await userSignUp
          .findOne({ email: data.email })
          .lean();
        if (signupUserExist) {
          let token = jwt.sign(
            { user_id: signupUserExist._id, email: signupUserExist.email },
            process.env.TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          resolve({ exist: true,token,userData:signupUserExist });

        } else {
          userSignUp.create({email:data.email,firstName:data.given_name,LastName:data.family_name}).then(async (response) => {
            let token = jwt.sign(
              { user_id: response._doc._id, email: response._doc.email },
              process.env.TOKEN_KEY,
              {
                expiresIn: "2h",
              }
            );
              
            response.token = token;
            await followersModel.create({
              user: response._doc._id,
              followers: [],
              following: [],
            });
            await save.create({ user: response._doc._id, posts: [] });
            console.log(response);
            resolve({ userData:response._doc,token, exist: false });
          });
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

          userSignUp.create(data).then(async (response) => {
            let token = jwt.sign(
              { user_id: response._id, email: response.email },
              process.env.TOKEN_KEY,
              {
                expiresIn: "2h",
              }
            );

            response.token = token;
            await followersModel.create({
              user: response._id,
              followers: [],
              following: [],
            });
            await save.create({ user: response._id, posts: [] });
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
        console.log(post);
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

        function count() {
          return new Promise((resolve, reject) => {
            save
              .findOne({ user: user.user_id })
              .populate("posts")
              .then((response) => {
                var index = 0;

                function res() {
                  resolve();
                }

                for (index = 0; index < posts.length; index++) {
                  if (response)
                    for (var i = 0; i < response.posts.length; i++) {
                      if ("" + posts[index]._id == "" + response.posts[i]._id) {
                        posts[index].save = true;
                        break;
                      } else {
                        posts[index].save = false;
                      }
                    }
                  if (index == posts.length - 1) {
                    res();
                  }
                }
              });
          });
        }
        async function saveCheck() {
          await count();
          resolve(posts);
        }
        saveCheck();
      } catch (error) {
        reject(error);
      }
    });
  },
  GiveLike: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  },
  GiveComment: (Comment) => {
    return new Promise((resolve, reject) => {
      try {
        postModel
          .updateOne(
            { _id: Comment.id },
            {
              $push: { comment: { user: Comment.user, text: Comment.comment } },
            }
          )
          .then((response) => {
            resolve();
          });
      } catch (err) {
        reject(err);
      }
    });
  },
  Follow: (body) => {
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  },
  getFriends: (body) => {
    return new Promise((resolve, reject) => {
      try {
        followersModel
          .find({ followers: body.user_id })
          .limit(7)
          .sort({
            updatedAt: -1,
          })
          .populate("user")
          .lean()
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  notFollowed: (body) => {
    return new Promise((resolve, reject) => {
      try {
        followersModel
          .find({
            $and: [
              { followers: { $ne: body.user_id } },
              { user: { $ne: body.user_id } },
            ],
          })
          .limit(3)
          .populate("user")
          .lean()
          .then(async (response) => {
            for (let index = 0; index < response.length; index++) {
              response[index].num = response[index].followers.length;
              if (response[index].user) {
                response[index].postCount = await postModel
                  .find({ user: response[index].user._id })
                  .count();
              }
            }

            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  getChat: (sendUser, toUser) => {
    return new Promise(async (resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  },
  chatCreate: (sendUser, toUser, messages, to) => {
    return new Promise(async (resolve, reject) => {
      try {
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
                    "to.messages": {
                      $each: [{ gotMessage: to }],
                      $position: 0,
                    },
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
      } catch (error) {
        reject(error);
      }
    });
  },
  getUserChat: (body) => {
    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  },
  setOnline: (body, status) => {
    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  },
  statusUpdate: (story) => {
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
        story.dt = d;
        let exist = await statusModel.findOne({ user: story.user });
        if (!exist) {
          statusModel.create(story).then(async (newPost) => {
            await newPost.populate("user");
            newPost.likeStatus = false;
            console.log(newPost);
            resolve(newPost);
          });
        } else {
          statusModel
            .updateOne(
              { user: story.user },
              { $push: { storyId: story.storyId } }
            )
            .then((response) => {
              resolve();
            });
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  getStory: (body) => {
    return new Promise((resolve, reject) => {
      try {
        followersModel
          .find({ followers: body.user_id })
          .populate("user")
          .then((response) => {
            let users = [];
            for (let index = 0; index < response.length; index++) {
              users.push(response[index].user._id);
            }
            statusModel
              .find({ user: users })
              .populate("user")
              .then((status) => {
                //status[0].seenStatus=true
                resolve(status);
              });
          });
      } catch (err) {
        reject(err);
      }
    });
  },
  seenStory: (body) => {
    return new Promise((resolve, reject) => {
      try {
        statusModel
          .updateOne({ _id: body.storyId }, { $push: { seen: body.user } })
          .then((response) => {
            resolve(response);
          });
      } catch (err) {
        reject(err);
      }
    });
  },
  Profile: (body) => {
    return new Promise((resolve, reject) => {
      try {
        userSignUp
          .updateOne({ _id: body.user }, { $set: { profile: body.postId } })
          .then((response) => {
            resolve(response);
          });
      } catch (err) {
        reject(err);
      }
    });
  },
  ProfilePicGet: (user) => {
    return new Promise((resolve, reject) => {
      try {
        followersModel
          .findOne({ user: user.user_id })
          .populate("user")
          .populate("followers")
          .lean()
          .then((followers) => {
            followersModel
              .find({ followers: user.user_id })
              .populate("user")
              .populate("followers")
              .lean()
              .then((following) => {
                resolve({ followers: followers, following: following });
              });
          });
      } catch (err) {
        reject(err);
      }
    });
  },
  Cover: (body) => {
    return new Promise((resolve, reject) => {
      try {
        userSignUp
          .updateOne({ _id: body.user }, { $set: { cover: body.storyId } })
          .then((response) => {
            resolve(response);
            console.log(response);
          });
      } catch (err) {
        reject(err);
      }
    });
  },
  addBio: (body) => {
    return new Promise((resolve, reject) => {
      try {
        console.log(body);
        userSignUp
          .updateOne({ _id: body.user }, { $set: body })
          .then((response) => {
            resolve(body);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  editBio: (body) => {
    return new Promise((resolve, reject) => {
      try {
        console.log(body);
        userSignUp
          .updateOne({ _id: body.user }, { $set: body })
          .then((response) => {
            resolve(body);
          });
      } catch (error) {
        reject(err);
      }
    });
  },
  deleteBio: (body) => {
    return new Promise((resolve, reject) => {
      try {
        console.log(body);
        userSignUp
          .updateOne({ _id: body.user }, { $set: body })
          .then((response) => {
            resolve(body);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  modalProfile: (id, myId) => {
    return new Promise((resolve, reject) => {
      try {
        followersModel.findOne({ user: id }).then((followers) => {
          followersModel.find({ followers: id }).then(async (following) => {
            followers = followers.followers.length;
            following = following.length;
            let posts = await postModel
              .find({ user: id })
              .populate("user")
              .populate("comment.user")
              .sort({ createdAt: -1 })
              .lean();
            posts = posts.map((obj) => {
              console.log("like checking");
              if (obj.likes) {
                for (let i = 0; i < obj.likes.length; i++) {
                  if (obj.likes[i] == myId) {
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
            console.log("after like checking");
            function count() {
              return new Promise((resolve, reject) => {
                save
                  .findOne({ user: myId })
                  .populate("posts")
                  .then((response) => {
                    var index = 0;
                    console.log("save checking", response);
                    function res() {
                      resolve();
                    }

                    for (index = 0; index < posts.length; index++) {
                      console.log("for outer");
                      if (response)
                        for (var i = 0; i < response.posts.length; i++) {
                          console.log("for inner");
                          if (
                            "" + posts[index]._id ==
                            "" + response.posts[i]._id
                          ) {
                            console.log("liked");
                            posts[index].save = true;
                            break;
                          } else {
                            posts[index].save = false;
                          }
                        }
                      console.log(index, posts.length);
                      if (index == posts.length - 1 || posts.length == 0) {
                        console.log("resolving");
                        res();
                      }
                    }
                  });
              });
            }
            async function saveCheck() {
              await count();
              // resolve(posts);
              resolve({ followers, following, posts });
            }
            saveCheck();
            // resolve({ followers, following });
          });
        });
      } catch (error) {
        reject(error);
      }
    });
  },
  save: (body, post) => {
    return new Promise(async (resolve, reject) => {
      try {
        let user = await save.findOne({ user: body.user_id });

        if (!user) {
          save.create({ user: body.user_id, posts: post }).then((response) => {
            resolve(response);
          });
        } else {
          let check = await save.findOne({
            $and: [{ user: body.user_id }, { posts: post }],
          });
          if (check) {
            save
              .updateOne({ user: body.user_id }, { $pull: { posts: post } })
              .then((response) => {
                resolve(response);
              });
          } else {
            save
              .updateOne({ user: body.user_id }, { $push: { posts: post } })
              .then((response) => {
                resolve(response);
              });
          }
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  getsaved: (id) => {
    return new Promise((resolve, reject) => {
      try {
        save
          .findOne({ user: id })
          .populate({
            path: "posts",
            model: "posts",
            populate: { path: "user", model: "users" },
          })
          .then(async (response) => {
            function count() {
              return new Promise((resolve, reject) => {
                let index = 0;
                let length = response.posts.length;
                let saved = response.posts.map((obj) => {
                  index++;
                  if (obj.likes) {
                    for (let i = 0; i < obj.likes.length; i++) {
                      if (obj.likes[i] == id) {
                        console.log("yes matched");
                        obj.likeStatus = true;
                        obj["likeStatus"] = true;
                        console.log(obj);
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
                if (index == length) {
                  resolve(saved);
                }
              });
            }

            //resolve(response);
            async function res() {
              let saved = await count();
              //console.log(saved);
              resolve(saved);
            }
            res();
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  removeFromSave: (body, post) => {
    return new Promise((resolve, reject) => {
      try {
        console.log(post);
        save
          .updateOne({ user: body.user_id }, { $pull: { posts: post } })
          .then((response) => {
            resolve(response);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  mypost: (id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let posts = await postModel
          .find({ user: id })
          .populate("user")
          .populate("comment.user")
          .sort({ createdAt: -1 })
          .lean();
        posts = posts.map((obj) => {
          if (obj.likes) {
            for (let i = 0; i < obj.likes.length; i++) {
              if (obj.likes[i] == id) {
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

        function count() {
          return new Promise((resolve, reject) => {
            save
              .findOne({ user: id })
              .populate("posts")
              .then((response) => {
                var index = 0;

                function res() {
                  resolve();
                }

                for (index = 0; index < posts.length; index++) {
                  if (response)
                    for (var i = 0; i < response.posts.length; i++) {
                      if ("" + posts[index]._id == "" + response.posts[i]._id) {
                        posts[index].save = true;
                        break;
                      } else {
                        posts[index].save = false;
                      }
                    }
                  if (index == posts.length - 1) {
                    res();
                  }
                }
              });
          });
        }
        async function saveCheck() {
          await count();
          resolve(posts);
        }
        saveCheck();
      } catch (error) {
        reject(error);
      }
    });
  },
  profileModalPost: (myid, id) => {
    return new Promise(async (resolve, reject) => {
      try {
        let posts = await postModel
          .find({ user: id })
          .populate("user")
          .populate("comment.user")
          .sort({ createdAt: -1 })
          .lean();
        posts = posts.map((obj) => {
          if (obj.likes) {
            for (let i = 0; i < obj.likes.length; i++) {
              if (obj.likes[i] == myid) {
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

        function count() {
          return new Promise((resolve, reject) => {
            save
              .findOne({ user: myid })
              .populate("posts")
              .then((response) => {
                var index = 0;

                function res() {
                  resolve();
                }
                if (posts.length == 0) {
                  res();
                }
                for (index = 0; index < posts.length; index++) {
                  if (response)
                    for (var i = 0; i < response.posts.length; i++) {
                      if ("" + posts[index]._id == "" + response.posts[i]._id) {
                        posts[index].save = true;
                        break;
                      } else {
                        posts[index].save = false;
                      }
                    }
                  if (index == posts.length - 1) {
                    res();
                  }
                }
              });
          });
        }
        async function saveCheck() {
          await count();
          resolve(posts);
        }
        saveCheck();
      } catch (error) {
        reject(error);
      }
    });
  },
  removePost: (body, post) => {
    return new Promise((resolve, reject) => {
      try {
        console.log("post", post);
        postModel
          .findOneAndDelete({ _id: post })
          .then((response) => {
            console.log(response);
            resolve(response.postId);
          })
          .catch((err) => {
            console.log("asdfdsf");
          });
      } catch (error) {
        console.log("sdff");
        reject(error);
      }
    });
  },
};
