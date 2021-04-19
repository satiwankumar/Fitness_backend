const express = require("express");
const _ = require('lodash')
const router = express.Router();
const { check, validationResult } = require('express-validator');

//middleware
const auth = require('../middleware/authMiddleware')
const admin = require('../middleware/adminMiddleware')

//servcies
const { url } = require('../utils');
const checkObjectId = require("../middleware/checkobjectId");


//Controller
const ExcersizeController = require('../controllers/excersizeController');
const excersizeModel = require("../models/excersize.model");






// @route Get api/excersizes (localhost:5000/api/users)
// @desc to getallexcersize 
// access Private


router.get('/', [auth], ExcersizeController.GET_EXCERSIZES);



// @route Post api/excersizes:excersize_id 
// @desc to get user bid 
// access private


// @access   Private
router.get('/:excersize_id',[auth,  checkObjectId('excersize_id')],ExcersizeController.GET_EXCERISZE_DETAIL_BY_ID);




// @route Post api/user/Signup 
// @desc to Add/Register user
// access public

router.post('/',[auth,admin,
    check('type', 'type is required').not().isEmpty(),
    check('name', 'name is required').not().isEmpty(),
    check('sets', 'sets is required').not().isEmpty(),
    check('reps', 'reps is required').not().isEmpty(),
    check('tempo', 'tempo is required').not().isEmpty(),
    check('rest', 'rest is required').not().isEmpty(),

],
ExcersizeController.ADD_EXCERSIZE
)



//update
router.post('/update', async (req, res) => {
  
    try {
   
        let excersize = await excersizeModel.updateMany(
            {rest:"60 sec"},
            [{
                $set: {rest:"60"}
            }]
          )
        

        res.status(200).json(excersize)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


module.exports = router






