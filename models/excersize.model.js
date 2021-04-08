
const mongoose = require('mongoose');
const ExcersizeSchema = new mongoose.Schema({
    
    session_no:{
        type: String,
        required:true
    },
    type: {
        type: String,
        required:true
    },
    type_image:{
        type:String,
        default:null
    },
    image:{
        type:String,
        default:null
    },
    name: {
        type: String,
        required:true
    },
    sets: {
        type: String,
        required:true
    },
    reps: {
        type: String,
        required:true
    },
    tempo: {
        type: String,
        required:true
    },
    rest: {
        type: String,
        required:true
    },
    
    is_completed: {
        type: Boolean,
        default:false
    }



});
ExcersizeSchema.set('timestamps', true)



module.exports = Excersizes = mongoose.model('Excersizes', ExcersizeSchema);
