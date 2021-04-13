const express = require("express");
const bcrypt = require('bcrypt')
const _ = require('lodash')
const fs = require('fs');
var path = require('path');
const {baseUrl}= require('../utils/url')
const {CreateNotification}  =  require('../utils/Notification')
const { check, validationResult } = require('express-validator');
const config = require('config')
//model
const User = require('../models/User.model');
const week_excersizesModel = require("../models/week_excersizes.model");

exports.Register = async (req, res, next) => {

    try {
        let error = []
        const errors = validationResult(req);
        const url = baseUrl(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // if user duplicated
        let user = await User.findOne({ email: req.body.email.toLowerCase() })
        if (user) {
            error.push({ message: "User already registered" })
            return res.status(400).json({ errors: error }
            )
        }

        //if password doesnot match
        // if (req.body.password !== req.body.confirmpassword) {
        //     error.push({ message: "confirm password doesnot match" })
        //     return res.status(400).json({ errors: error })
        // }


        //decode the base 4 image 
        let image = req.body.image ? req.body.image : ""
        let pathName = "uploads/images/abc.jpg"
        const salt = await bcrypt.genSalt(10)
        // let filename = bcrypt.hashSync(r, salt).substring(-1, 7)
        // console.log(image)
        if (req.body.image) {
            console.log("image found")
            var data = image.replace(/^data:image\/\w+;base64,/, "");
            let buff = new Buffer.from(data, 'base64');
            let r = Math.random().toString(36).substring(7)

            pathName = `uploads/images/${r}.png`;
            fs.writeFileSync(path.join(__dirname, `../${pathName}`), buff)
            // var full_address = req.protocol + "://" + req.headers.host ;
        }
        //create new user
        user = new User({
            username: req.body.username,
            email: req.body.email.toLowerCase(),
            image: pathName

            //   image: req.file.path 
        });


        //hash passoword
        user.password = bcrypt.hashSync(req.body.password, salt)
        const token = await user.generateAuthToken()


        await user.save()
        let weekExcersizes = await week_excersizesModel.find({user :null},{_id:0,excersize:1,week:1,day:1,user:1,is_off:1})
         weekExcersizes.forEach((item,index)=> weekExcersizes[index].user = user._id)
        console.log(weekExcersizes)
    //    return   
        let userWeeks =await week_excersizesModel.insertMany([
            ...weekExcersizes
        ])

        // console.log(weekExcersizes)


        const notification = {
            user: null,
            notificationType: "Admin",
            notificationId: user._id,
            title: "User is created",
            body: "user a has been created"


        }
        CreateNotification(notification)

        user.image = `${url}${user.image}`

     
        res.status(200).json({
            message: "Registration Success, please login to proceed",
            token: token,
            createdUser: user,
             
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

exports.GetUsers  = async (req, res) => {
    const {page,limit,selection,fieldname,order} = req.query
    const currentpage = page?parseInt(page,10):1
    const per_page = limit?parseInt(limit,10):5
    const CurrentField = fieldname?fieldname:"createdAt"
    const currentOrder = order? parseInt(order,10):-1
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] =currentOrder
    // return res.json(sort)
    
    const currentSelection = selection?selection:1


    try {
        let users = await User.find({status:currentSelection}).limit(per_page).skip(offset).sort(sort)
        // console.log(users)
        if (!users.length) {
            return res
                .status(400)
                .json({ message: 'no user exist' });
        }
        const url =   baseUrl(req)  
        users.forEach(user=>
           user.image = `${url}${user.image}`
            )
            let Totalcount = await User.find({status:currentSelection}).count()
            const paginate = {
            currentPage: currentpage,
            perPage: per_page,
            total: Math.ceil(Totalcount/per_page),
            to: offset,
            data: users
            }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.EditProfile  =  async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }


    const {
        username,
        city,
        country,
        phone_no,
        state,
        zip_code,
        address 

    } = req.body;


    try {


        let user = await User.findOne({ _id: req.user._id })
        // console.log(user)
        if (!user) {
            return res
                .status(400)
                .json({ message: 'no  User Found' });
        }
        user.username = username
        user.city=city?city:user.city,
        user.country=country?country:user.country,
        user.state=state?state:user.state,
        user.zip_code=zip_code?zip_code: user.zip_code,
        user.address=address?address:user.address
        user.phone_no=phone_no?phone_no:user.phone_no
            await user.save();
        const url =   baseUrl(req)  
        user.image = `${url}${user.image}`
        const resuser = user
        res.status(200).json({
            message: "Profile Updated Successfully",
            user: resuser
        });
    } catch (err) {
      
       
            const errors =[]
            errors.push({message : err.message}) 
            res.status(500).json({ errors: errors });
        
    }
}
exports.GetCurrentUser = async (req, res) => {

    try {
        let user = await User.findOne({ _id: req.user._id }).lean()
        // console.log(user)
        if (!user) {
            return res
                .status(400)
                .json({ message: 'User doesnot exist' });
        }
            const url =   baseUrl(req)  
           user.image = `${url}${user.image}`
        


        // const reviews = await Review.find({luggerUser:req.user._id}).lean()
        // let totalRating = 0
        // let length =reviews.length 
        // for(let i =0;i<reviews.length;i++){
        //     totalRating = totalRating +   reviews[i].rating  
        // }
        // let Average = totalRating/length
        // user.AverageRating = Average
       
        res.status(200).json({
            "user": (_.pick(user, ['_id', 'username', 'email', 'image','averageRating','city','country','state','zip_code','address']))

        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
exports.GetUserById =  async (req, res) => {
    let  user_id = req.params.user_id
    try {
      const user = await User.findOne({
        _id: user_id
      })

      if (!user) return res.status(400).json({ message: 'User Detail not found' });
      const url =   baseUrl(req)  
      user.image = `${url}${user.image}`
      return res.json(user);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
  }
exports.ApproveAndBlockUser = async (req, res) => {
    const {status} = req.params
  //   console.log(status)
  try {
    
    let user = await User.findOne({ _id: req.body.userId });
          // console.log(user)
    if (!user)
     { return res.status(400).json({ message: 'no user exist ' });}
  

     if (status == 1 && user.status == 1 ) {
      return res.json({ message: 'This user is  already active ' });
    }

    else if (status == 0 && user.status == 0) {
      return res.json({ message: 'This user is already blocked' });
    }
 

 
    if (  user.status ==0 && status == 1 ) {
      
    
      user.status = status;
      await user.save();
      return res.status(200).json({ message: 'User is  Active' });
    }
     if (user.status == 1 && status == 0  ) {
      user.status = status;
      await user.save();
      return res.status(200).json({ message:  'User is blocked' });
    }
    
   
    else{
      return res.status(200).json({ message: 'Invalid status' })
    }
    
      
  } catch (error) {
  //   console.error(error.message);
    res.status(500).json({error:error.message});
  }
}
exports.UploadProfilePicture = async (req, res) => {

    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        // let checkBase64 = isBase64(req.body.image, { allowMime: true });
        // if (!checkBase64) {
        //     return res.status(400).json({ errors: "please upload base64 image format " });
        // }
        let user = await User.findOne({ _id: req.user._id })
        // console.log(user)
        if (user && user.image !=="") {
            fs.unlinkSync(path.join(__dirname, `../${user.image}`));
            user.image =""
        }
        


        let image = req.body.image
        let buff = new Buffer.from(image, 'base64');
        let r = Math.random().toString(36).substring(7)
        let pathName = `uploads/images/${r}.png`;
        fs.writeFileSync(path.join(__dirname, `../${pathName}`), buff)
        // var full_address = req.protocol + "://" + req.headers.host ;
        // console.log(url(req, pathName))

        // //create new user
       user.image = pathName
        await user.save()
        res.status(200).json({
            message: "profileImage Uploaded Successsfully"
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }


}

exports.Update_User =async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
    }


    const {
       username,
        city,
        country,
        state,
        zip_code,
        address ,
        phone_no

    } = req.body;


    try {


        let user = await User.findOne({ _id: req.params.userId })
        // console.log(user)
        if (!user) {
            return res
                .status(400)
                .json({ message: 'no  User Found' });
        }
        user.username = username
        user.city=city?city:user.city,
        user.country=country?country:user.country,
        user.state=state?state:user.state,
        user.zip_code=zip_code?zip_code:user.zip_code,
        user.address=address?address:user.address
        user.phone_no=phone_no?phone_no:user.phone_no

            await user.save();
        const url =   baseUrl(req)  
        user.image = `${url}${user.image}`
        const resuser = user
        res.status(200).json({
            message: "User Profile Updated Successfully",
            user: resuser
        });
    } catch (err) {
      
       
            const errors =[]
            errors.push({message : err.message}) 
            res.status(500).json({ errors: errors });
        
    }
}