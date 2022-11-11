const express = require("express");
const app = express();
const port = 3000;
const logger = require("morgan");
const cookieParser = require("cookie-parser");
const users = require("./routers/user");
const db = require("./config/connection");


const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server,{
    cors:{
        origin:"http://localhost:3001",
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
  socket.disconnect("disconnect", () => {
    console.log("user diconnected", socket.id);
  });
});

app.use("/", users);

server.listen(port, () => {
  console.log(`server is running in port ${port}`);
});
