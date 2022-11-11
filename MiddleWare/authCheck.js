const jwt = require("jsonwebtoken");
require("dotenv").config();

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

    }
}