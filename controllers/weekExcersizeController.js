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
      
      for(let i=0;i<weekexcersize.excersize.length;i++){
          if(weekexcersize.excersize[i].excersize!=null){
        weekexcersize.excersize[i].excersize.type_image = `${url}${ weekexcersize.excersize[i].excersize.type_image}`
        weekexcersize.excersize[i].excersize.image = `${url}${ weekexcersize.excersize[i].excersize.image}`
    }
      }


      if (!weekexcersize) return res.status(400).json({ message: 'Week Excersize  not found' });
    


      return res.json(weekexcersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}
exports.GET_ALL_WEEK_EXCERCISES_OF_CURRENT_USER = async (req, res) => {
    
    let user_id = req.user._id
    // let active ="true"
    try {
      const weekexcersizes = await weekExcersize.find({
        user: user_id
      }).populate("excersize.excersize")
      const url =   baseUrl(req)  
      console.log(weekexcersizes)

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
        user: req.user._id,isActive:true
      }).populate("excersize.excersize")
    
    //   for(let i=0;i<weekexcersize)
    


      return res.json(weekexcersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
}