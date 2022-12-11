const admin = require("../services/adminServices");
module.exports = {
    AdminLogin: async (req, res, next) => {
    admin
      .login(req.body)
      .then((userStatus) => {
        res.json(userStatus);
      })
      .catch((err) => {
        console.log(err);
        next(err);
      });
  },
  Reports:(req,res,next)=>{
    admin.reports().then((response)=>{
        res.json(response)
    }).catch((err)=>{
        next(err)
    })
  },
  removePost:(req,res,next)=>{
    admin.removePost(req.body.post).then((response)=>{
        res.json()
    })
  },
  ignore:(req,res,next)=>{
    admin.ignore(req.body.id).then((response)=>{
        res.json(response)
    })
  }
}