const mongoose=require('mongoose')
require("dotenv").config();

module.exports={
    connect:()=>{
        try{
            mongoose.connect(process.env.MONGO_DB,(err)=>{
                if(err){
                    console.log(err);
                }else{
                    console.log('database connected');
                }
            })
            
        }catch(err){
             console.log(err);
        }
       
    }
}