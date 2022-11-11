const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports={
    userGet:(req,res,next)=>{
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
      return next();

    },
    userPost:(req,res,next)=>{
      const token = req.body.token || req.query.token || req.headers.token;
  
    if (!token) {
      lo                                                                                             
      console.log("1");
      return res.json({status:false})
    }
    try {
      const decoded = jwt.verify(token, process.env.TOKEN_KEY);
      req.user = decoded;
      
      req.body.user=decoded.user_id
    } catch (err) {
      return res.json({status:false})
    }
    return next();

  }
}