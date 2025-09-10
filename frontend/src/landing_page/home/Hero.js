import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero() {
    const [message, setMessage] = useState('');

    useEffect(() => {
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlMessage = urlParams.get('message');
        if (urlMessage) {
            setMessage(decodeURIComponent(urlMessage));
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, []);

    return ( 
        <div className='container' p-5>
            <div className='row text-center' >
                {/* Message Display */}
                {message && (
                    <div className="alert alert-info alert-dismissible fade show" role="alert" style={{
                        margin: '20px auto',
                        maxWidth: '600px'
                    }}>
                        ℹ️ {message}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setMessage('')}
                            aria-label="Close"
                        ></button>
                    </div>
                )}
                
                <img src='media/Images/homeHero.png' alt='Hero Image' className='mb-5'/>
                <h1>Invest in everything!</h1>
                <p>Online platform to invest in stocks,mutual funds and more</p>
                <Link to="/signup" className='p-2 btn btn-primary fs-5 text-decoration-none' style={{width:"20%",margin:"0 auto"}}>
                    Sign up Now
                </Link>

            </div>

        </div>
     );
}

export default Hero;