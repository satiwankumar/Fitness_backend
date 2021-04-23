const express = require('express')
const app = express()
const path  = require('path')
const port  = process.env.PORT || 5000
const connectDB = require('./config/db')
var cors = require('cors');
var multipart = require('connect-multiparty');

app.use(multipart());
require('dotenv').config()

//db connection
connectDB()
app.use(function(req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST,GET,OPTIONS,PUT,DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Accept');
  
    next();
  });
  
  app.use(cors())
  app.options('*', cors())
  app.use(express.json({limit: '50mb'}))
  
  //Init middleware
require('./routes')(app)

app.get("/uploads/images/:name", (req, res) => {
 
    // const myURL  = new URL(req.url)
    // console.log(myURL.host);

    res.sendFile(path.join(__dirname, `./uploads/images/${req.params.name}`));
  });
 

app.get('/',(req,res)=>{
    res.send('fitness Server Runing')
})
app.listen(port,()=>{
    console.log(`Server is running at the port ${port}`)
})