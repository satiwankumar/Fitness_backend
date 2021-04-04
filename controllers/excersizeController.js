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
const excersizeModel = require("../models/excersize.model");

exports.ADD_EXCERSIZE = async (req, res, next) => {

    try {
        let error = []
        const errors = validationResult(req);
        const url = baseUrl(req)

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        // if excersize duplicated
        let excersize = await excersizeModel.findOne({ type: req.body.type,name:req.body.name })
        if (excersize) {
            error.push({ message: "excersize already registered" })
            return res.status(400).json({ errors: error }
            )
        }

        //create new user
        excersize = new excersizeModel({
            type: req.body.type,
            name: req.body.name,
            sets: req.body.sets,
            reps: req.body.reps,
            tempo: req.body.tempo,
            rest: req.body.rest,

        });



        await excersize.save()
     

  

     
        res.status(200).json({
            message: "Excersize Added Successfully",
        
            //  data: JSON.stringify(response1.data) 
        });

    } catch (error) {
        res.status(500).json({
            error: error.message
        });
    }
}

exports.GET_EXCERSIZES = async (req, res) => {
    const {page,limit,selection,fieldname,order} = req.query
    const currentpage = page?parseInt(page,10):1
    const per_page = limit?parseInt(limit,10):5
    const CurrentField = fieldname?fieldname:"createdAt"
    const currentOrder = order? parseInt(order,10):1
    let offset = (currentpage - 1) * per_page;
    const sort = {};
    sort[CurrentField] =currentOrder
    // return res.json(sort)
    
    const currentSelection = selection?selection:1


    try {
        let excersizes = await excersizeModel.find().limit(per_page).skip(offset).sort(sort)
        // console.log(excersizes)
        if (!excersizes.length) {
            return res
                .status(400)
                .json({ message: 'no excersize exist' });
        }
        const url =   baseUrl(req)  
        excersizes.forEach(user=>
           user.image = `${url}${user.image}`
            )
            let Totalcount = await User.find({status:currentSelection}).count()
            const paginate = {
            currentPage: currentpage,
            perPage: per_page,
            total: Math.ceil(Totalcount/per_page),
            to: offset,
            data: excersizes
            }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}

exports.GET_EXCERISZE_DETAIL_BY_ID =  async (req, res) => {
    let  excersize_id = req.params.excersize_id
    try {
      const excersize = await excersizeModel.findOne({
        _id: excersize_id
      })

      if (!excersize) return res.status(400).json({ message: 'excersize Detail not found' });

      return res.json(excersize);
    } catch (err) {
      console.error(err.message);
      return res.status(500).json({ error: err.message });
    }
  }


