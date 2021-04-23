const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt')
const { check, validationResult } = require('express-validator')
const moment = require("moment");
const _ = require('lodash')

const { baseUrl } = require('../utils/url');
//middleware
const auth = require('../middleware/authMiddleware')
const User = require('../models/User.model')
//models
const Token = require('../models/Token.model')
const Session = require('../models/Session.model')
//services
const { sendEmail } = require('../service/email')
const Controller = require('../controllers/authController')

moment().format();


//@route Get api/auth
//@desc Test route
//access Public


router.get('/', auth,Controller.LoadUser)



//@route Post api/login
//@desc Test route
//access Public


router.post('/login', Controller.Login);







//Post /api/auth/forgot
//access public 

router.post("/forgot", check('email', 'Email is required').isEmail(), Controller.ForgotPassword)



//post    /api/auth/verifyCode/
//access private


router.post("/verifycode", check('resetCode', 'Code is Required'), Controller.VerifyCode);

//post    /api/auth/reset/
//access private



router.post("/reset/:token", [
    check('newpassword', 'newpassword is required').not().isEmpty(),
    check('confirmpassword', 'confirmpassword is required').not().isEmpty()], Controller.ResetPassword);


//post    /api/auth/changepassword 
//access private
router.post(
    '/changepassword',
    [auth,
        [
            check('currentpassword', 'current Password is required').not().isEmpty(),
            check('newpassword', 'New Password is required').not().isEmpty(),
            check('confirmpassword', 'Confirm password is required').not().isEmpty()

        ]],
    Controller.ChangePassword
);


router.get('/logout', auth, Controller.Logout)


module.exports = router