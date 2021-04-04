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
const UserController = require('../controllers/userController')




// @route Get api/users (localhost:5000/api/users)
// @desc to getallusers 
// access Private


router.get('/', [auth, admin], UserController.GetUsers);


//@route Get api/users/me (localhost:5000/api/users/me)
//@desc to getUserByid 
//access Private

router.get('/me', auth, UserController.GetCurrentUser);


// @route Post api/:userid 
// @desc to get user bid 
// access private


// @access   Private
router.get('/:user_id',
    [auth, admin, checkObjectId('user_id')],
    UserController.GetUserById
);




// @route Post api/user/Signup 
// @desc to Add/Register user
// access public

router.post('/signup', [
    check('firstname', 'name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'please enter a password of 6 or more characters').isLength({ min: 6 }),
    check('confirmpassword', 'please enter a password of 6 or more characters').isLength({ min: 6 }),
],
    UserController.Register
)


// @route Post api/user/uploadpicture 
// @desc to UploadProfilePicture
// access pvt

router.post('/uploadpicture', [auth,
    [
        check('image', 'image is required').not().isEmpty(),

    ]
], UserController.UploadProfilePicture)


// @route Post api/users/edit (localhost:5000/api/users/edit)
// @desc to edit profile  
// access private
router.put('/edit', [auth, [check('firstname', 'firstname is required').not().isEmpty(), check('lastname', 'lastname is required').not().isEmpty()],],
    UserController.EditProfile
);



// @route Post api/users/status/:status 
// @desc to ActiveAndBlockUser
// access pvt
router.post('/status/:status', [auth, admin], UserController.ApproveAndBlockUser);





router.post('/edit/:userId',
[
    auth,
    checkObjectId('userId'),
    [
        check('firstname', 'firstname is required').not().isEmpty(),
        check('lastname', 'lastname is required').not().isEmpty()
        
    ],
],
UserController.Update_User
);



// router.delete('/delete/:id',[auth,admin],async (req,res)=>{
//     const id = req.params.id

//         await User.findOneAndRemove({ _id: id });
// res.json("user deleted")

// })




module.exports = router






