const mongoose = require('mongoose')
const Task = require('./task')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema( {   
name:{
    type: String,
    trim: true,
    required: true
},
email:{
    type: String,
    required: true,
    unique:true,
    trim: true,
    lowercase: true,
    validate(value){
        if(!validator.isEmail(value)){
            throw new Error('Email is invalid')
        }
    }
},
password:{
    type: String,
    required: true,
    trim: true,
    minlength: 7,
    validate(value){
        if(value.toLowerCase().includes('password')){
            throw new Error('Password cannot contain the word password !')
        }
    }
},
age:{
    type: Number,
    default: 0,
    validate(value){
        if(value<0){
            throw new Error('Put a valid age please !')
        }
    }
},
tokens:[{
    token:{
        type: String,
        required: true
    }
}],
avatar:{
    type: Buffer
}
},{
    timestamps: true
})

userSchema.virtual('tasks',{
    ref: "Task",
    localField: "_id",
    foreignField: "owner"
})

userSchema.methods.toJSON = function(){
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

userSchema.methods.generateAuthToken = async function(){
    const user = this
    const token = jwt.sign({_id: user._id.toString()},process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({token})
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async(email,password)=>{
    const user = await User.findOne({email})
    if(!user){
        throw new Error('You are not signed up!')
    }
    const isMatched = await bcrypt.compare(password, user.password)

    if(!isMatched){
        throw new Error('Incorrect Password')
    }
    return user
}

userSchema.pre('save', async function(next){
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

userSchema.pre('remove',async function(next){
    const user = this
    await Task.deleteMany({owner: user._id})
    next()
})

const User = mongoose.model('user', userSchema)
module.exports = User