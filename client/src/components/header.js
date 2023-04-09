import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import dbank from "../iuh.png"
export default class Header extends Component{
    render(){
       return(
         <nav className="navbar navbar-primary fixed-top bg-primary flex-md-nowrap p-0 shadow">
                <a
                    className="navbar-brand col-sm-3 col-md-2 mr-0"
                    href="#"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                <img src={dbank} className="App-logo m-auto " alt="logo" height="32"/>
                <b className='text-dark'>IUHBANK</b>
                </a>
        </nav>
       )
    }
}