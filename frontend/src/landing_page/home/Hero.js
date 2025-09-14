import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function Hero() {
    const [message, setMessage] = useState('');
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Check for URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlMessage = urlParams.get('message');
        if (urlMessage) {
            setMessage(decodeURIComponent(urlMessage));
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // Check if user is logged in
        const checkAuthState = () => {
            const storedUser = localStorage.getItem('user');
            const storedToken = localStorage.getItem('authToken');
            const storedSessionId = localStorage.getItem('sessionId');
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
            
            if (storedUser && storedToken && storedSessionId && isLoggedIn) {
                try {
                    const userData = JSON.parse(storedUser);
                    setUser(userData);
                    setIsLoggedIn(true);
                } catch (error) {
                    console.error('Error parsing user data:', error);
                    setIsLoggedIn(false);
                }
            } else {
                setIsLoggedIn(false);
            }
        };

        checkAuthState();

        // Listen for storage changes (when user logs in/out in another tab)
        const handleStorageChange = (e) => {
            if (e.key === 'user' || e.key === 'authToken' || e.key === 'sessionId' || e.key === 'isLoggedIn') {
                checkAuthState();
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    return ( 
        <div className='container p-5'>
            <div className='row text-center' >
                {/* Message Display */}
                {message && (
                    <div className={`alert ${isLoggedIn ? 'alert-success' : 'alert-info'} alert-dismissible fade show`} role="alert" style={{
                        margin: '20px auto',
                        maxWidth: '600px'
                    }}>
                        {isLoggedIn ? '🎉' : 'ℹ️'} {message}
                        <button 
                            type="button" 
                            className="btn-close" 
                            onClick={() => setMessage('')}
                            aria-label="Close"
                        ></button>
                    </div>
                )}

                
                <img src='media/Images/homeHero.png' alt='Hero Image' className='mb-5'/>
                
                {!isLoggedIn && (
                    // Not logged in state
                    <>
                        <h1>Invest in everything!</h1>
                        <p>Online platform to invest in stocks, mutual funds and more</p>
                        <Link to="/signup" className='p-2 btn btn-primary fs-5 text-decoration-none' style={{width:"20%",margin:"0 auto"}}>
                            Sign up Now
                        </Link>
                    </>
                )}

            </div>

        </div>
     );
}

export default Hero;