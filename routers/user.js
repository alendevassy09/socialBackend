const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const middelWare=require('../MiddleWare/jwtMiddleWare')
const authCheck=require('../MiddleWare/authCheck')




router.get('/authCheck',authCheck.user)
router.post("/userLogin",userController.Login);
router.post("/signup", userController.Signup);
router.get("/search",middelWare.userGet,userController.Search);
router.post('/post',middelWare.userPost,userController.Post)
router.get('/getPost',middelWare.userGet,userController.getPosts)
router.post('/likePost',middelWare.userPost,userController.GiveLike)


module.exports = router;
