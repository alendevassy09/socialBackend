const mongoose=require('mongoose')
module.exports={
    connect:()=>{
        mongoose.connect('mongodb+srv://alendevassy09:sirmx9fXyMrtab09@cluster0.vw6pqhv.mongodb.net/socialMedia',(err)=>{
            if(err){
                throw err
            }else{
                console.log('database connected');
            }
        })
    }
}