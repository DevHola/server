const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const Schema = mongoose.Schema


const UserSchema = new Schema({
   email:{
       type:String,
       required:true,
       unique:true
   },
   username:{
       type:String,
       required:true
   },
   
   password:{
       type:String,
       required:true
   },

  image:{
    type:String,
    required:false
  },
  createdAt:{
    type: Date,
    default: Date.now
  }
   
});
// Remember this is the password encryption function
UserSchema.pre("save",function(next){
    let user = this;
    if(this.isModified('password')|| this.isNew){
       bcrypt.hash(user.password , 10 , function(err,hash){
                if(err){
                    return next(err)
                }
                user.password = hash;
                next();

            })
       

    }else{
        return next();
    }

});
// Remember this is the compare password function used in login function
UserSchema.methods.comparePassword = function(password,next){
    let user = this;
    return bcrypt.compareSync(password,user.password);
};
module.exports = mongoose.model('user',UserSchema)