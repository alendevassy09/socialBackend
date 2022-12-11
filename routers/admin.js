const express = require("express");
const router = express.Router();
const adminController=require('../controller/adminController')
router.post("/adminlogin", adminController.AdminLogin);
router.get("/reported", adminController.Reports);
router.patch('/removePost',adminController.removePost)
router.patch('/ignore',adminController.ignore)
module.exports = router;
