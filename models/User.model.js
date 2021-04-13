const mongoose = require('mongoose');
const jwt = require('jsonwebtoken')
const config = require('config');


const UserSchema = new mongoose.Schema({
    image:
    {
        type: String
    },
    username: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 50
    },
   
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        minlength: 5,
        maxlength: 1024
    },
 
    resetCode: {type: Number, default: ""},
    status: {type: Number, default: 1},
    
    isAdmin: {
        type: Boolean,
        default: false,
    },
    googleId:{
        type:String,
        default:null
    },
    averageRating:{
        type:Number,
        default:0
    },
    city:{
        type:String,
        default:null
    }, 
    country: {
        type:String,
        default:null
    },
    state:{
        type:String,
        default:null
    } ,
    zip_code:{
        type:String,
        default:null
    },
    address:{
        type:String,
        default:null
    },
    phone_no:{
        type:String,
        default:null
    }
});

UserSchema.set('timestamps', true)








 
UserSchema.methods.generateAuthToken = function () {
    const token = jwt.sign({
        _id: this._id, isAdmin: this.isAdmin ,status:this.status,createdAt:this.createdAt
     },config.get('jwtSecret'),{expiresIn :  '24h' });
    return token;
}




module.exports = User = mongoose.model('user', UserSchema)