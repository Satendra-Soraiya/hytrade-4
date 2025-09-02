import React from 'react';
import { Link } from 'react-router-dom';
function Hero(){
    return ( 
        <div className='conatiner text-center p-5'>
            <h2>Our Products</h2>
            <h4 className='text-muted mt-5 '>Sleek, modern, and intuitive trading platforms</h4>

            <p className='text-muted mt-3'> Check out our <a href=''style={{textDecoration:"None"}}>investment offerings <i class="fa fa-long-arrow-right" aria-hidden="true"></i></a>
             </p>
        </div>
     );
}

export default Hero ;