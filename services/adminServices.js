const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const adminModel=require('../models/AdminModel')
const ReportModel = require('../models/ReportModel')
const postModel=require('../models/PostModel')
const save=require('../models/SavedModal')
const report =require('../models/ReportModel')
module.exports = {
    login: (data) => {
      return new Promise(async (resolve, reject) => {
        try {
          let userData = await adminModel.findOne({ email: data.email });
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
    reports:()=>{
        return new Promise((resolve,reject)=>{
            try {
                ReportModel.find().populate({
                    path: "postId",
                    model: "posts",
                    populate: { path: "user", model: "users" },
                  }).then((response)=>{
                    resolve(response)
                })
            } catch (error) {
                reject(error)
            }
        })
    },
    removePost: (post) => {
        return new Promise((resolve, reject) => {
          try {
            console.log("post", post);
            postModel
              .findOneAndDelete({ _id: post })
              .then((response) => {
                console.log(response);
    
                save.find().then(async (saves) => {
                  for (let index = 0; index < saves.length; index++) {
                    if (saves[index].posts.includes(post)) {
                      await save.updateOne(
                        { _id: saves[index]._id },
                        { $pull: { posts: post } }
                      );
                    }
                  }
                await report.deleteOne({postId:post})
                  resolve(response.postId);
                });
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
      ignore:(id)=>{
        return new Promise((resolve,reject)=>{
            try {
                report.deleteOne({_id:id}).then((response)=>{
                    resolve()
                })
            } catch (error) {
                reject(error)
            }
        })
      }
}