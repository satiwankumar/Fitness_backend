//importing api's
const express = require('express')
const Users = require('./routes/usersRoute')
const Auth  = require('./routes/authRoute')
const Notification = require('./routes/notificationsRoute')
const Dashboard = require('./routes/dashboardRoute')
const Contact = require('./routes/contactRoute')
const Excersize = require('./routes/excersizeRoute')
const WeekExcersize = require('./routes/weekExcersizeRoute')
module.exports = function(app){
//look for dependency
//Middlware
app.use(express.json())

app.use('/api/users',Users)
app.use('/api/auth',Auth)
app.use('/api/dashboard',Dashboard)
app.use('/api/notifications',Notification)
app.use('/api/contact',Contact)
app.use('/api/excersizes',Excersize)
app.use('/api/weekexcersizes',WeekExcersize)


// app.use(error)


}