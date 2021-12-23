const mongoose=require('mongoose')
const validator=require('validator')
const bcrypt=require('bcryptjs')
const jwt=require('jsonwebtoken')
const Task = require('./task')

const UserSchema=new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique:true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password can not contain "password"')
            }
        },
        minlength: 6

    },
    age: {
        type: Number,
        validate(value) {
            if (value < 0) {
                throw new Error('Age must be a positive number')
            }
        }
    },
    tokens:[{
        token:{
            type:String,
            require:true
        }
    }]
},{
    timestamps:true
})

UserSchema.virtual('tasks',{
    ref:'Task',
    localField:'_id',
    foreignField:'owner'
})

UserSchema.methods.toJSON=function(){
    const user=this
    const userObject=user.toObject()
    delete userObject.password     
    delete userObject.tokens
    return userObject
}

// Genarate token for user
UserSchema.methods.genarateAuthToken=async function(){
    const user=this
    const token=jwt.sign({_id:user._id.toString()},'sameera')
    user.tokens=user.tokens.concat({token:token})
    await user.save()
    return token

}
// find user by credentials
UserSchema.statics.findByCredentials =async (email,password)=>{
const user=await User.findOne({email})
if(!user){
    throw new Error('Unable to login')
}
const isMatch=await bcrypt.compare(password,user.password)

if(!isMatch){
    throw new Error('Unable to login')
}
return user
}

// use middle ware to run consistatly for save function
// Hash the plain text password before saving
UserSchema.pre('save',async function(next){
const user=this

if(user.isModified('password')){
    user.password= await bcrypt.hash(user.password,8)
}


next()
})

// DELETE USER TASK WHEN USER IS REMOVED
UserSchema.pre('remove',async function(next){
const user=this
await Task.deleteMany({owner:user._id})
next()
})

const User = mongoose.model('User', UserSchema)

module.exports=User