
const mongoose = require('mongoose');
const Excersize = require('./excersize.model')
const WeekExcersizes = new mongoose.Schema({

    week: 
    {
        type: String,
        required: true
    },
    day:
    {
        type: String,
        required: true
    },
    excersize:
    [
       { excersize : {
            type: mongoose.Schema.Types.ObjectId,
            ref: Excersize
        },
        isCompleted:{
            type:Boolean,
            default:false
        }
    }

    ],
    user:{
        type: mongoose.Schema.Types.ObjectId,
        ref: User
    }

});
WeekExcersizes.set('timestamps', true)



module.exports = Excersizes = mongoose.model('WeekExcersizes', WeekExcersizes);
