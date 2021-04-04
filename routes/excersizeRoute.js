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
const ExcersizeController = require('../controllers/excersizeController')




// @route Get api/excersizes (localhost:5000/api/users)
// @desc to getallexcersize 
// access Private


router.get('/', [auth, admin], ExcersizeController.GET_EXCERSIZES);



// @route Post api/excersizes:excersize_id 
// @desc to get user bid 
// access private


// @access   Private
router.get('/:excersize_id',[auth, admin, checkObjectId('excersize_id')],ExcersizeController.GET_EXCERISZE_DETAIL_BY_ID);




// @route Post api/user/Signup 
// @desc to Add/Register user
// access public

router.post('/', [
    check('type', 'type is required').not().isEmpty(),
    check('name', 'name is required').not().isEmpty(),
    check('sets', 'sets is required').not().isEmpty(),
    check('reps', 'reps is required').not().isEmpty(),
    check('tempo', 'temp is required').not().isEmpty(),
    check('rest', 'rest is required').not().isEmpty(),

],
ExcersizeController.ADD_EXCERSIZE
)



module.exports = router






