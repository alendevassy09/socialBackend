const mongoose=require('mongoose')
module.exports={
    connect:()=>{
        try{
            mongoose.connect('mongodb+srv://alendevassy09:sirmx9fXyMrtab09@cluster0.vw6pqhv.mongodb.net/socialMedia',(err)=>{
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