const userSignUp = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const postModel = require("../models/PostModel");
const { post } = require("../routers/user");
require("dotenv").config();

module.exports = {
  login: (data) => {
    return new Promise(async (resolve, reject) => {
      try {
        console.log(data, "login");
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
        console.log(data);
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
  Search: (name) => {
    return new Promise(async (resolve, reject) => {
      try {
        let resultName = await userSignUp
          .find({ firstName: new RegExp("^" + name, "i") })
          .lean();
        console.log(resultName);
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
          newPost.likeStatus=false
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
        posts=posts.map((obj)=>{

          if(obj.likes){
            for(let i=0;i<obj.likes.length;i++){
              if(obj.likes[i]==user.user_id){
                obj.likeStatus=true
                return obj
              }
            }
            obj.likeStatus=false
            return obj
          }else{
            obj.likeStatus=false
            return obj
          }
        })
        resolve(posts);
      } catch (error) {
        reject(error);
      }
    });
  },
  GiveLike: (data) => {
    console.log(data, "data");
    return new Promise(async (resolve, reject) => {
      const liked = await postModel
        .findOne({ likes: data.user, _id: data.postId })
        .lean();
      if (!liked) {
        postModel
          .findOneAndUpdate({ _id: data.postId }, { $push: { likes: data.user } })
          .then((response) => {
            console.log(response);
            resolve({status:true,likes:response.likes.length+1});
          });
      }else{
        postModel
        .findOneAndUpdate({ _id: data.postId }, { $pull: { likes: data.user } })
        .then((response) => {
          console.log(response);
          resolve({status:false,likes:response.likes.length-1});
        });
      }

      //resolve("liked");
    });
  },
};
