const jwt = require('jsonwebtoken');
module.exports = (req,res,next)=>{
    try {//this below const auth header and token is what allows deciphering using bearer
        const authHeader = req.headers['authorization'];
        let token = authHeader && authHeader.split(' ')[1];
       // let checkBarrier = "Bearer"

    if(!token){
          res.status(403).send({success:'false', message:'no token provided'});
    }else{
       
     jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
        if(err){
            res.json({
                success:'false',
                message:'Authorization failed'
            });
           }else{
            req.decoded = decoded;
            next();
        }
     })}
    //req.userData = decoded;
    //next();
    } catch (error) {
        res.status(500).json({
            success:'false',
            message:error.message
        });
    }
    
   
   /*
   if(token){
      
       jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
           if(err){
            res.json({
                success:'false',
                message:'Authorization failed'
            });
           }else{
               req.decoded = decoded;
               next();
           }
       })
   }else{
    return res.json({
        message:'Authenication Failed,No token',
        success:'false'
    });
   }*/
}