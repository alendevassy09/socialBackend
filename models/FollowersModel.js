const mongoose=require('mongoose')
let schema=mongoose.Schema
const Model=schema({
    user:{
        type: schema.Types.ObjectId,
        ref: 'users'

    },
    followers:[
        {
            type: schema.Types.ObjectId,
            ref: 'users',
            default:undefined
        }
    ],
    following:[
        {
            type: schema.Types.ObjectId,
            ref: 'users',
            default:undefined
        }
    ]
    
},{
    
    timestamps:true
}
)

const followersModel=mongoose.model("followers",Model)
module.exports = followersModel