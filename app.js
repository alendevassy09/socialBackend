const express = require("express");
const app = express();
const port = 4000;
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const users = require("./routers/user");
const admin = require('./routers/admin')
const db = require("./config/connection");
const ErrorHandler = require('./MiddleWare/ErrorHandle')

const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
    cors:{
        origin:"https://vall-e.netlify.app",
        methods:["GET","POST"]
    }
});

const cors = require("cors");
var compression = require("compression");
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
db.connect();

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);
  socket.on("join",(data)=>{
    console.log(data);
      socket.join(data)
  })
  socket.on("send_message",(data)=>{
    console.log(data);
    socket.to(data.room).emit("rececive_msg",data)
  })
});

app.use("/", users);
app.use('/admin',admin)
app.use(ErrorHandler)
server.listen(port, () => {
  console.log(`server is running in port ${port}`);
});

