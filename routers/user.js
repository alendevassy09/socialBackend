const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const middelWare = require("../MiddleWare/jwtMiddleWare");
const authCheck = require("../MiddleWare/authCheck");

router.get("/authCheck", authCheck.user);
router.post("/userLogin", userController.Login);
router.patch("/passwordUpdate", userController.PasswordUpdate);
router.get('/sendEmail',userController.sendEmail)
router.post("/signup", userController.Signup);
router.get("/search", middelWare.userGet, userController.Search);
router.post("/post", middelWare.userPost, userController.Post);
router.get("/getPost", middelWare.userGet, userController.getPosts);
router.post("/likePost", middelWare.userPost, userController.GiveLike);
router.post("/comment", middelWare.userPost, userController.Comment);
router.post("/follow", middelWare.userPost, userController.Follow);
router.get("/getFriends", middelWare.userGet, userController.getFriends);
router.get("/notFollowed", middelWare.userGet, userController.notFollowed);
router.get("/getChats",middelWare.userGet,userController.getUserChat)
router.get("/chat", middelWare.userGet, userController.getChat);
router.post("/chatCreate", middelWare.userPost, userController.chatCreate);
router.get("/online",middelWare.userGet,userController.setOnline)
router.post("/statusUpdate",middelWare.userPost,userController.statusUpdate)
router.get("/getStory",middelWare.userGet,userController.getStory);
router.patch('/seenStory',middelWare.userPost,userController.seenStory);
router.put('/profile',middelWare.userPost,userController.Profile);
router.get('/profilePicGet',middelWare.userGet,userController.ProfilePicGet);
router.put('/cover',middelWare.userPost,userController.Cover);
router.post('/addBio',middelWare.userPost,userController.addBio)
router.patch('/deleteBio',middelWare.userPost,userController.deleteBio)
router.post('/editBio',middelWare.userPost,userController.editBio)
router.get('/modalProfile',middelWare.userGet,userController.modalProfile);
router.patch('/save',middelWare.userPost,userController.save);
router.get('/getsaved',middelWare.userGet,userController.getsaved);
router.patch('/removeFromSave',middelWare.userPost,userController.removeFromSave);
router.get("/mypost", middelWare.userGet, userController.mypost);
router.get("/profileModalPost", middelWare.userGet, userController.profileModalPost);
router.patch('/removePost',middelWare.userPost,userController.removePost);

module.exports = router;
