const mongoose =require('mongoose')
const validator = require('validator')
const bcryptjs = require ('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username : {
        type: String,
        required:true,
        trim : true
    },
    age :{
        type:Number,
        defult : 18,
        validate(val){
            if(val<0){
                throw new Error (' age must be positave')
            }
        }
    },
    city : {
        type:String
    },
    email : {
        type:String,  //email is a string
        required : true,
        trim: true,
        lowercase:true,
        unique:true,
        validate(val){
            if(!validator.isEmail(val)){
                throw new Error("Invalid Email")
            }
        }
    },
    password : {
        type : String ,
        required :true,
        trim : true , 
        minlength:10,
        validate(val){
            const password= new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])");
            if(!password.test(val)){
                throw new Error ('password must have upper and lower and numbers and special caracter ! @ # $ % & *')
            }

        }

    },
    tokens :[ {
        type : String , 
        require :true
    }
        
]
})
userSchema.pre("save", async function(next) {
    if (this.isModified('password')) {
        try {
            const hashedPassword = await bcryptjs.hash(this.password, 8);
            this.password = hashedPassword;
        } catch (error) {
            throw error; // Handle the error appropriately
        }
    }
    next(); // Call next to move on to the next middleware or save operation
});
///////////////////////////////////////////////////////////////////////////
//login
//statics => use function on model
userSchema.statics.findByCredentials = async (em , pass)=>{

    const user = await User.findOne({email:em})
    console.log(user);
    if(!user){
        throw new Error ("Unable to login   ")
    } 
    console.log(user);
    const isMatch = await bcryptjs.compare(pass ,user.password)
    if(!isMatch){
        throw Error('Unable to login  ');
    }
    return user
    
}

///////////////////////////////////////////////////////////////////////////
userSchema.methods.generateToken = async function(){
    const user = this
    const token = jwt.sign ({_id:user._id.toString() } , 'roro')
    user.tokens = user.tokens.concat(token)
    return token
}
///////////////////////////////////////////////////////////////////////////
userSchema.methods.toJSON= function(){
    const user = this 
    //convert doc to obj
    
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}
///////////////////////////////////////////////////////////////////////////
const User =mongoose.model('User' ,userSchema)

module.exports={
    User
}