const user = require("../services/userService");
module.exports = {
  Login: async (req, res, next) => {
    let userStatus = await user.login(req.body);
    console.log('1');
    res.json(userStatus);
  },
  Signup:async(req,res,next)=>{
    console.log(req.body);
        await user.signup(req.body).then((response)=>{
          res.json({response});
        })
       
  },
  Search:async(req,res,next)=>{
    let name=req.headers.name
    console.log(name);
    await user.Search(name).then((response)=>{
      res.json(response)
    })
  },
  Post:async(req,res,next)=>{
   user.Post(req.body).then((response)=>{
    res.json(response)
   }) 
  },
  getPosts:async(req,res,next)=>{
    user.getPosts(req.user).then((posts)=>{
      res.json(posts)
    })
  },
  GiveLike:(req,res,next)=>{
    user.GiveLike(req.body).then((response)=>{
      res.json(response)
    })
  }
};
