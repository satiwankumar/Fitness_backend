const express = require("express");
const mongoose = require('mongoose')
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
const weekExcersize = require("../models/week_excersizes.model");
var moment = require('moment');
const { report } = require("../routes/excersizeRoute");
const excersizeModel = require("../models/excersize.model");

var weekday = new Array(7);
weekday[0] = "Sunday";
weekday[1] = "Monday";
weekday[2] = "Tuesday";
weekday[3] = "Wednesday";
weekday[4] = "Thursday";
weekday[5] = "Friday";
weekday[6] = "Saturday";

excersize = [
    {"excersize": null},
    {"excersize": null},
    {"excersize": null},
    {"excersize":null}
 ],


 exports.UPDATE_PLAN =async (req, res) => {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
  }

const {week_excersize_id,session_no,week,day} = req.body

  try {

    let currentUserPlan = await weekExcersize.findOne({user:req.user._id,_id:week_excersize_id,week:week,day:day}).sort({createdAt:1})
    let mainPlan = await weekExcersize.findOne({user:null,week:week,day:day}).sort({createdAt:1})
    let excersizes = await excersizeModel.find({session_no:session_no}).select({_id:1})
    currentUserPlan.excersize.forEach((element,index) => {
      // console.log(currentUserPlan.excersize[index].excersize ,  excersizes[index]._id )
            currentUserPlan.excersize[index].excersize =  excersizes[index]._id 
    });
    mainPlan.excersize.forEach((element,index) => {
      // console.log(mainPlan.excersize[index].excersize ,  excersizes[index]._id )
            mainPlan.excersize[index].excersize =  excersizes[index]._id 
    });


    currentUserPlan.save()
    mainPlan.save()

    
// console.log(mainPlan.plan)


    // let currenPlan = await weekExcersize.findOne({user:null}).populate("excersize.excersize").sort({createdAt:1})
    // let weekexcersizes = await weekExcersize.findOne({user:null}).populate("excersize.excersize").sort({createdAt:1})

      if (!mainPlan) {
          return res
              .status(400)
              .json({ message: 'no  plan Found' });
      }
    
    
      res.status(200).json({
          message: "Plan Updated Successfully",
          currentUserPlan:currentUserPlan,
          mainPlan: mainPlan,
          excersizes:excersizes
         
      });
  } catch (err) {
    
     
          const errors =[]
          errors.push({message : err.message}) 
          res.status(500).json({ errors: errors });
      
  }
}

 
exports.GET_ALL_LEFT_OVER_EXCERSIZES =  async (req, res) => {
    let user_id = req.user._id
    console.log(req.user.createdAt)
    let createdDate  = new Date(req.user.createdAt)
    let lastDate = moment(createdDate).add(42,'days').format('DD-MM-YYYY')
    let currentDate = new Date()
    let currentday = currentDate.getDay()

    currentDate= moment(currentDate)
   let difference =  currentDate.diff(createdDate,'days')
    // let createdDate+42/7
    // console.log()
  

    let currentweek=0;
    if(difference>=0 && difference<=7){
        currentweek=1
    }
    else if(difference>=8 && difference<=14){
        currentweek=2
    }
    
    else if(difference>=15 && difference<=21){
        currentweek=3
    }
    else if(difference>=22 && difference<=28){
        currentweek=4
    }
    else if(difference>=29 && difference<=35){
        currentweek=5
    }
    else if(difference>=36 && difference<=42){
        currentweek=6
    }
    // let day = currentday.toLowerCase
    console.log(typeof(weekday[currentday].toLowerCase()))
    console.log("currentWeek",weekday[currentday])
    console.log("lastDate",lastDate)
    console.log("difference",difference)
    console.log("currentDate",currentDate)
    console.log("currentWeek",currentweek)

    try {

    

      const weekexcersize = await weekExcersize.find({
        user: user_id, 
        week:{$lte :currentweek},
          is_completed:{$ne: true},
          is_off:{$ne: true}
      }).populate("excersize.excersize").sort({createdAt:1})
      const url =   baseUrl(req)  
      

      if (!weekexcersize.length) return res.status(400).json({ message: 'Week Excersize  not found' });
      
      for(let i=0;i<weekexcersize.length;i++){
        for(let j=0;j<weekexcersize[i].excersize.length;j++){          
            if(weekexcersize[i].excersize[j].excersize!=null){
        weekexcersize[i].excersize[j].excersize.type_image = `${url}${ weekexcersize[i].excersize[j].excersize.type_image}`
        weekexcersize[i].excersize[j].excersize.image = `${url}${ weekexcersize[i].excersize[j].excersize.image}`
            }
    }
      }


    


      return res.json(weekexcersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}

exports.ADD_WEEK_EXCERSIZE = async (req, res, next) => {

    try {
        let error = []
        const errors = validationResult(req);
        const url = baseUrl(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // if excersize duplicated
        let weekexcersize = await weekExcersize.findOne({ week: req.body.week,day:req.body.day ,user:req.body.user})
        if (weekexcersize) {
            error.push({ message: "week Excersize already registered" })
            return res.status(400).json({ errors: error }
            )
        }
        
       

        //create new week Excersize
        weekexcersize = new weekExcersize({
            week: req.body.week,
            day: req.body.day,
            excersize: req.body.excersize,
            is_off:req.body.is_off,
            user:req.body.user?req.body.user:null
            
        });

        await weekexcersize.save()

        res.status(200).json({
            message: "week Excersize Added Successfully",
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

exports.GET_WEEK_EXCERSIZES = async (req, res) => {
    const {page,limit,selection,fieldname,order} = req.query
    const currentpage = page?parseInt(page,10):1
    const per_page = limit?parseInt(limit,10):5
    const CurrentField = fieldname?fieldname:"createdAt"
    const currentOrder = order? parseInt(order,10):1
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] =currentOrder
    
    const currentSelection = selection?selection:1
    try {
        let weekexcersize = await weekExcersize.find().populate('excersize').limit(per_page).skip(offset).sort(sort)
        // console.log(weekexcersize)
        if (!weekexcersize.length) {
            return res
                .status(400)
                .json({ message: 'No week Excersize Exist' });
        }
    
            let Totalcount = await weekExcersize.find().count()
            const paginate = {
            currentPage: currentpage,
            perPage: per_page,
            total: Math.ceil(Totalcount/per_page),
            to: offset,
            data: weekexcersize
            }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.GET_WEEK_EXCERISZE_DETAIL_BY_ID =  async (req, res) => {
    let  weekexcersize_id = req.params.weekexcersize_id
    try {
      const weekexcersize = await weekExcersize.findOne({
        _id: weekexcersize_id
      })

      if (!weekexcersize) return res.status(400).json({ message: 'Week Excersize Detail not found' });

      return res.json(weekexcersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}

exports.GET_TODAY_WEEK_EXCERCISES_BY_CURRENT_USER = async (req, res) => {
    
    let user_id = req.user._id
    console.log(req.user.createdAt)
    let createdDate  = new Date(req.user.createdAt)
    let lastDate = moment(createdDate).add(42,'days').format('DD-MM-YYYY')
    let currentDate = new Date()
    let currentday = currentDate.getDay()

    currentDate= moment(currentDate)
   let difference =  currentDate.diff(createdDate,'days')
    // let createdDate+42/7
    // console.log()
  

    let currentweek=0;
    if(difference>=0 && difference<=7){
        currentweek=1
    }
    else if(difference>=8 && difference<=14){
        currentweek=2
    }
    
    else if(difference>=15 && difference<=21){
        currentweek=3
    }
    else if(difference>=22 && difference<=28){
        currentweek=4
    }
    else if(difference>=29 && difference<=35){
        currentweek=5
    }
    else if(difference>=36 && difference<=42){
        currentweek=6
    }
    // let day = currentday.toLowerCase
    console.log(typeof(weekday[currentday].toLowerCase()))
    console.log("currentWeek",weekday[currentday])
    console.log("lastDate",lastDate)
    console.log("difference",difference)
    console.log("currentDate",currentDate)
    console.log("currentWeek",currentweek)

    try {

    

      const weekexcersize = await weekExcersize.findOne({
        user: user_id,week:currentweek,day:weekday[currentday].toLowerCase()
      }).populate("excersize.excersize")
      const url =   baseUrl(req)  
      
     


      if (!weekexcersize) return res.status(400).json({ message: 'Week Excersize  not found' });
      for(let i=0;i<weekexcersize.excersize.length;i++){
        if(weekexcersize.excersize[i].excersize!=null){
      weekexcersize.excersize[i].excersize.type_image = `${url}${ weekexcersize.excersize[i].excersize.type_image}`
      weekexcersize.excersize[i].excersize.image = `${url}${ weekexcersize.excersize[i].excersize.image}`
  }
    }


      return res.json(weekexcersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}
exports.GET_ALL_WEEK_EXCERCISES_OF_CURRENT_USER = async (req, res) => {
    
let {week}= req.query 
let user_id = req.user._id
console.log(req.user.createdAt)
let createdDate  = new Date(req.user.createdAt)
let lastDate = moment(createdDate).add(42,'days').format('DD-MM-YYYY')
let currentDate = new Date()
let currentday = currentDate.getDay()

currentDate= moment(currentDate)
let difference =  currentDate.diff(createdDate,'days')
// let createdDate+42/7
// console.log()


let currentweek=0;
if(difference>=0 && difference<=7){
    currentweek=1
}
else if(difference>=8 && difference<=14){
    currentweek=2
}

else if(difference>=15 && difference<=21){
    currentweek=3
}
else if(difference>=22 && difference<=28){
    currentweek=4
}
else if(difference>=29 && difference<=35){
    currentweek=5
}
else if(difference>=36 && difference<=42){
    currentweek=6
}
// let day = currentday.toLowerCase
console.log(typeof(weekday[currentday].toLowerCase()))
console.log("currentWeek",weekday[currentday])
console.log("lastDate",lastDate)
console.log("difference",difference)
console.log("currentDate",currentDate)
console.log("currentWeek",currentweek)

    
    // let active ="true"
    let weekfilter = week? {week: week}:{}
    try {
      const weekexcersizes = await weekExcersize.find({
       ...weekfilter,
       week:{$lte:currentweek},
        user: user_id,
        is_off:false
      }).populate("excersize.excersize").sort({createdAt:1})
      const url =   baseUrl(req)  
      // console.log(weekexcersizes)

      if (!weekexcersizes) return res.status(400).json({ message: 'Week Excersize  not found' });
      for(let i=0;i<weekexcersizes.length;i++){
        for(let j=0;j<weekexcersizes[i].excersize.length;j++){          
            if(weekexcersizes[i].excersize[j].excersize!=null){
        weekexcersizes[i].excersize[j].excersize.type_image = `${url}${ weekexcersizes[i].excersize[j].excersize.type_image}`
        weekexcersizes[i].excersize[j].excersize.image = `${url}${ weekexcersizes[i].excersize[j].excersize.image}`
            }
    }
      }

      return res.json(weekexcersizes);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}

exports.UPDATE_USER_EXCERSIZE_STATUS =  async (req, res) => {
    
    let {excersize_id,status} = req.body

    try {
      const weekexcersize = await weekExcersize.findOne({
        user: req.user._id,"excersize._id":excersize_id 
      }).populate("excersize.excersize")
    
      if (!weekexcersize) return res.status(400).json({ message: 'Week Excersize  not found' });
      
       let index = weekexcersize.excersize.findIndex(item=>item._id==excersize_id)
       weekexcersize.excersize[index].isCompleted=status
      await weekexcersize.save()
        
       for(let i=0;i<weekexcersize.excersize.length;i++){
        if(weekexcersize.excersize[i].excersize!=null){
      weekexcersize.excersize[i].excersize.type_image = `${url}${ weekexcersize.excersize[i].excersize.type_image}`
      weekexcersize.excersize[i].excersize.image = `${url}${ weekexcersize.excersize[i].excersize.image}`
  }
    }
   


      return res.json(weekexcersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}

exports.MARK_WEEK_EXCERSIZE_COMPLETE =  async (req, res) => {
    
    let {week_excersize_id,status} = req.body
    console.log(req.body)

    try {
      const weekexcersize = await weekExcersize.findOne({
        user: req.user._id,_id : week_excersize_id 
      })
    
      if (!weekexcersize) return res.status(400).json({ message: 'Week Excersize  not found' });
      
      weekexcersize.is_completed = status
       await weekexcersize.save()

    //    let index = weekexcersize.excersize.findIndex(item=>item._id==excersize_id)
    //    weekexcersize.excersize[index].isCompleted=status
    //    weekexcersize.save()
        
       for(let i=0;i<weekexcersize.excersize.length;i++){
        if(weekexcersize.excersize[i].excersize!=null){
      weekexcersize.excersize[i].excersize.type_image = `${url}${ weekexcersize.excersize[i].excersize.type_image}`
      weekexcersize.excersize[i].excersize.image = `${url}${ weekexcersize.excersize[i].excersize.image}`
  }
    }
// console.log(weekexcersize)
   


      return res.json(weekexcersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}


exports.GET_BASIC_PLAN = async (req, res) => {
    
      try {
        let weekexcersizes = await weekExcersize.find({user :null,  is_off:false}).populate("excersize.excersize").sort({createdAt:1})
        const url =   baseUrl(req)  
        // console.log(weekexcersizes)
        let weekexcersizesCount = await weekExcersize.find({user :null})

  
        if (!weekexcersizes) return res.status(400).json({ message: 'Week Excersize  not found' });
        for(let i=0;i<weekexcersizes.length;i++){
          for(let j=0;j<weekexcersizes[i].excersize.length;j++){          
              if(weekexcersizes[i].excersize[j].excersize!=null){
          weekexcersizes[i].excersize[j].excersize.type_image = `${url}${ weekexcersizes[i].excersize[j].excersize.type_image}`
          weekexcersizes[i].excersize[j].excersize.image = `${url}${ weekexcersizes[i].excersize[j].excersize.image}`
        }
      }
        }
  
        return res.json(weekexcersizesCount);
      } catch (err) {
        console.error(err.message);
        return res.status(500).json({ error: err.message });
      }
  }


  



