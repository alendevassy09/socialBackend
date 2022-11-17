const userSignUp = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const postModel = require("../models/PostModel");
const { post } = require("../routers/user");
const followersModel = require("../models/FollowersModel");
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
        .then((response) => {
          resolve(response);
        });
    });
  },
};
