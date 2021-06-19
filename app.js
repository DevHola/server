const express = require('express')
const app = express()
const server = require("http").Server(app)
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const path = require('path')
const io = require('socket.io')(server)

app.use(morgan('combined'))
app.use(bodyParser.json({limit:'50mb'}))
app.use(bodyParser.urlencoded({extended:false,limit:'50mb',parameterLimit:1000000 }))
app.use(cors())
//profile picture upload folder
app.use('/upload',express.static('upload'))

//routes imports
const authrouter = require('./routes/auth')

//.user-routes
app.use('/Api',authrouter)

//.env
dotenv.config({path:path.join(__dirname,'/.env')})


// mongodb connection
mongoose.connect(process.env.MONGO_URL,{
    useNewUrlParser:true,
    useUnifiedTopology:true
},
err=>{ if(err){
    console.log(err);
}else{
    console.log('connected to db')
}})
// listening from here
io.on("connection", function(socket){
    console.log("connected successful" + socket.id);
     socket.on("join-room",(roomId,userId)=>{
		 console.log(userId)
		 console.log(roomId)
        socket.join(roomId)
        socket.to(roomId).emit('user-connected',userId);
    
        
    });
})
server.listen(process.env.PORT || 9090,function(){
    console.log('listening on port 9090');
})