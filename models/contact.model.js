
const mongoose = require('mongoose');
const User = require('./User.model')
const contactSchema = new mongoose.Schema({
    user :{
            type:mongoose.Schema.Types.ObjectId,
            ref:User,
            required:true
    },

    subject:{
        type: String,
        default:null,
        required: true,
    },
    message: {
        type: String,
        required: true
    }

});
contactSchema.set('timestamps',true)









module.exports=  Contact = mongoose.model('Contact', contactSchema);
