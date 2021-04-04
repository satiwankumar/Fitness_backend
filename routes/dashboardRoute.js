const express = require('express')
const router = express.Router()
const { check, validationResult } = require('express-validator');
const auth = require('../middleware/authMiddleware')

const admin = require('../middleware/adminMiddleware')









//place order 



router.get('/adminstats',auth,admin, async (req, res) => {
    

    try {

        
    
      
                        let totalData= await Appoinment.aggregate([
                                
                            
                               
                                {$group: { _id : {
                                  year:{$year:"$createdAt"},
                                  month:{$month:"$createdAt"},
                                  },
                                  count:{$sum: 1 }
                                }
                              }
                              
                                
                            
                        ])
                       


        const paginate = {
         
          
            data:totalData
            
        }
        res.status(200).json(paginate)
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});



module.exports=router