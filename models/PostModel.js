const mongoose=require('mongoose')
let schema=mongoose.Schema
const Model=schema({
    user:{
        type: schema.Types.ObjectId,
        ref: 'users'

    },

    postId:String,
    description:String,
    likes:[{
        type: schema.Types.ObjectId,
        ref: 'users'

    }],
    dt:String
    
},{
    
    timestamps:true
}
)

const postModel=mongoose.model("posts",Model)
module.exports = postModel