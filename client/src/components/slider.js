import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
export default class DemoCarousel extends Component {
    
    render() {
        return (
            <div>
                <Carousel dynamicHeight ={true} showThumbs ={false} showArrows ={true}  >
                <div>
                    <img src= "image/iuh.jpg" style={{width:"90vw",  height: "300px"}}/>
                    <p className="legend">Legend 1</p>
                </div>
                <div>
                    <img src="image/iuh2.jpg"  style={{width:"700px" , height: "300px"}}/>
                    <p className="legend">Legend 2</p>
                </div>
                <div>
                    <img src="assets/3.jpeg" style={{width:"700px" , height: "300px"}} />
                    <p className="legend">Legend 3</p>
                </div>
            </Carousel>
            </div>
        );
    }
};