const express = require('express')
const router = express.Router()
const User =require('../models/user')
const jwt = require('jsonwebtoken')
const verifyToken = require('../middlewares/verify-token')
const multer = require('multer')
const path = require('path')
//register functionality
router.post('/Auth/register',async (req,res)=>{
    if(!req.body.email || !req.body.username || !req.body.password){
        res.json({success: false,message:"Please enter email or password"})
    }else{
        try{
          
         const user = new User({ 
		  email : req.body.email,
          username : req.body.username,
          password : req.body.password

         });
         await user.save(err=> {
             if(err){
                 res.json(err);
             }else{
              const token = jwt.sign(user.toJSON(),process.env.JWT_SECRET,
               {
                 expiresIn:604800 
               },
               
               )
               return res.status(200).json({
                  success:'true',
                  token:token,
                  message:'new user created'
              })
             }
         })
      
      }catch(err){
        return res.status(500).json({
            success:'false',
            message:'Error creating new user'
        })
      }
    }




});
//this is used to verify our user token
router.get('/Auth/user',verifyToken,async (req,res,next)=>{
	let token= req.headers.token;
	console.log(token)
    try {
        let user =  await User.findOne({_id:req.headers.token})
              if(user) {  
                  res.json({
                    user:user,
                    success:true});
               }
           else{ 
                res.status(404).json({success:'false',
                 message:'No user found'
                });}
        


    } catch (error) {
        res.status(500).json({
            success:'false',
            message:error.message
        });
    }
  })
  //login functionality
router.post('/Auth/login',async (req,res)=>{
    if(!req.body.email || !req.body.password){
        res.json({
            message:'Enter Email and Password',
            success:'false'
        })

    }else{
        try {
            const user = await User.findOne({
                email:req.body.email
            })
            if(!user){
                res.status(403).send({
                    message:'Authentication Fail.user not found',
                    success:'fail'
                })
            }else{
                if(user.comparePassword(req.body.password)){
                    let token = jwt.sign(
                        user.toJSON()
                   ,process.env.JWT_SECRET,
                   {
                     expiresIn:604800 
                   },
                   
                   );
                   res.status(200).json({
                       success:'true',
                       token:token
                   });
                }else{
                    res.status(403).send({
                        success:'fail',
                        message:'Authentication failed. password incorrect'
                    })
                }

            }
        } catch (error) {
            res.status(500).json({
                success:'false',
                message:error.message
            });
        }
    }
})
//multer middleware for file upload to user profile
const storage = multer.diskStorage({
    destination: function (req, file, cb){
        cb(null,'./upload/profile_pictures')
    },
    filename:function (req,file,cb){
        cb(null,  Date.now()+ '-' + file.originalname);
    }
});
const filefilter = (req,res,cb)=>{
    if(file.mimetype ==='image/jpeg'||
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg'){
        cb(null,true)
    }else{
        cb(null,false)
    }
}

const upload =  multer({storage:storage,
    limit:{
    fileSize: 1024 * 1024 * 5
          },
    filefilter:filefilter
});

////update profile after registration
router.put('/user/:id',upload.single('image'),async (req,res,next)=>{
  try {
    const img = req.file.path;
    await User.findOneAndUpdate({
       _id:req.params.id
   },{//the reason we only set bio and image is because they are the only field we accept and want to change
       $set:{
          image : img
       },
   },
   {upsert:true});
   res.json({
       message:'sucessful'
   })
  } catch (error) {
    res.json({
        message:'fail',
        error:error.message
    })
  }
})
//get the user data before editing
router.get('/user/:id',async(req,res)=>{
 try {
    const user = await User.findOne({
        _id:req.params.id
    })
    if(user){
        res.json({
            user:user,
            success:true
        })
    }
    else{
        res.json({
            
            success:false
        })
    }
 } catch (error) {
    res.json({
        message:'fail',
        error:error.message
    })
  } 
 
})
module.exports= router 