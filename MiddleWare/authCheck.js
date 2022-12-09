const jwt = require("jsonwebtoken");
require("dotenv").config();
const jwt_decoder=require('jwt-decode')
module.exports={
    user:(req,res,next)=>{
        const token = req.body.token || req.query.token || req.headers.token;
   
      if (!token) {
        return res.json({status:false})
      }
      try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
      } catch (err) {
        return res.json({status:false})
      }
      return res.json({status:true})

    },
    googleAuth:(req,res,next)=>{
      const token = req.body.token || req.query.token || req.headers.token;
      
    if (!token) {
      return res.json({status:false})
    }
    try {
      const decoded = jwt.decode(token)
      console.log(decoded);
      req.user = decoded;
    } catch (err) {
      return res.json({status:false})
    }
    return next()

  }
}