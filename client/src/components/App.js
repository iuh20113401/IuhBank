import React from "react";
import LoginForm from "./Login"
import Admin from "./admin"
import User from "./User"
import io from 'socket.io-client';
import {
    BrowserRouter as Router,
    Route
}from "react-router-dom"
import { Routes  } from 'react-router-dom'
const socket = io('http://localhost:3000');
function App ()  {
      return(
        <Router>
          <Routes>
          <Route  path ='/' element={<LoginForm socket = {socket}/>}/>
          <Route path = '/admin' element = {<Admin socket = {socket}/>} />
          <Route path = '/user' element ={<User socket = {socket}/>} />
        </Routes>
        </Router>
      )
}

export default App;
