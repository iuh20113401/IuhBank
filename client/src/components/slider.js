import React, { Component } from 'react';
import dbank from "../iuh.png"
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import Typewriter from "typewriter-effect"
import './background.css'
import { Carousel } from 'react-responsive-carousel';
import { NavLink } from 'react-router-dom';
export default class Slider extends Component {
    render() {
        return (
            <div>
                <Header/>
            <div>
            
            <Carousel className='all' dynamicHeight ={true} showThumbs ={false} showArrows ={true}  >
                <div class="bigimg">
                    <h1>
                        <Typewriter options = {{
                                autoStart: true,
                                deplay: 30,
                                loop:true,
                                strings: ["Chào mừng bạn đến với website <br>của chúng tôi","Đây là website của trường IUH","Hãy bấm nút \"Kết nối\" góc phía trên bên phải để đăng nhập vào website"]
                            }}>
                            
                        </Typewriter>
                    </h1>
                    
                </div>
                <div class="smallimg">
                    <h1>
                        
                    </h1>
                </div>
                <div class="folderimg">
                <h1>i am folderimg image</h1>
                </div>
            </Carousel>
            </div>
            </div>

        );
    }
};
class Header extends Component{
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
                <button className='btn btn-primary text-right ml-auto '><NavLink to={'/login'} className="text-white">Kết nối</NavLink></button>
        </nav>
       )
    }
}