const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require('http').createServer(app);
const cors = require("cors");
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
let newUser = [];
let userStake = [];
const io = require("socket.io")(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }})
io.on('connection', (socket) => {
  console.log('A client connected.');
  // Listen for 'join' event
  socket.on('join', (room) => {
    const index = newUser.findIndex(item => item.id === room);
    if(index == -1){
      newUser.push({id: room, value: 0})
      console.log(index)
    }
  });
  socket.on('admin', message => {
    console.log(message)
    if(newUser != []){
      socket.emit("room",newUser);
    }
  });
  // Listen for 'leave' event
  socket.on('leave', (room) => {
    // Leave the specified room
    socket.leave(room);
    console.log(`Client left room: ${room}`);
  });
 
  // Listen for 'message' event
  socket.on('userValue', (data) => {
    console.log(data.id)
    console.log(data.value)
  for (let i = 0; i < newUser.length; i++) {
  if (newUser[i].id === data.id) {
    newUser[i].value = data.value;
    console.log(newUser[i]);
    break; // Stop looping once we find the match
  }}
    
  });
    socket.on('userStake', (data) => {
    console.log(data.id)
    console.log(data.value)
  for (let i = 0; i < userStake.length; i++) {
  if (userStake[i].id === data.id) {
    userStake[i].amount = data.value;
    console.log(userStake[i]);
  }}
  });
  socket.on("GetStake", () =>{
      socket.emit('stake',userStake);
      console.log(userStake);
  })
  socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });
});

app.post('/login', (req, res) => {
  const { account } = req.body;
  const admin = '0xa12e9Fae4482eB7B1276e7E698d05fC2c274ADC7';
  let newRedirect= 0;
  if(account == admin){
    newRedirect = '2';
  }else{
    newRedirect = '1';}
  res.send(newRedirect);
});
app.post('/request', (req, res) => {
  const {account}  = req.body;
  for (let i = 0; i <= newUser.length; i++) {
  if (newUser[i].id === account) {
    const value = newUser[i].value;
    res.send(value);
    break; // Stop looping once we find the match
  }
}});
app.post('/method', (req, res) => {
  const {account, method}  = req.body;
  console.log(account, method)
  for (let i = 0; i <= newUser.length; i++) {
  if (newUser[i].id === account) {
    const value = newUser[i].value;
    userStake.push({id: account, amount: value, method: method});
    newUser.remove[newUser[i]];
    break; // Stop looping once we find the match
  }
}
});
http.listen(3000, () => {
  console.log('listening on *:3000');
});

