import React from 'react';
import { Link } from 'react-router-dom';

function Footer() {
    return ( 
        <footer style={{
            backgroundColor: '#212529',
            color: '#ffffff',
            padding: '3rem 0',
            marginTop: '3rem'
        }}>
            <div className="container">
                <div className="row">
                    {/* Company Info */}
                    <div className="col-lg-4 col-md-6 mb-4">
                        <div style={{marginBottom: '1rem'}}>
                            <Link to="/" style={{textDecoration: 'none'}}>
                                <img 
                                    src="media/Images/logo.png"
                                    style={{
                                        maxWidth: '180px',
                                        width: 'auto',
                                        height: '60px',
                                        objectFit: 'contain',
                                        filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))',
                                        borderRadius: '8px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        padding: '8px'
                                    }}
                                    alt="Hytrade Logo"
                                />
                            </Link>
                        </div>
                        <p style={{color: '#6c757d', marginBottom: '1rem'}}>
                            Your trusted partner in online trading and investment. 
                            Start your financial journey with our advanced trading platform.
                        </p>
                        <div className="d-flex gap-3">
                            <a href="https://facebook.com" style={{textDecoration: 'none'}}>
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
                                    alt="Facebook"
                                    style={{
                                        height: '24px',
                                        width: 'auto',
                                        filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        padding: '4px'
                                    }}
                                />
                            </a>
                            <a href="https://twitter.com" style={{textDecoration: 'none'}}>
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg"
                                    alt="Twitter"
                                    style={{
                                        height: '24px',
                                        width: 'auto',
                                        filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        padding: '4px'
                                    }}
                                />
                            </a>
                            <a href="https://linkedin.com" style={{textDecoration: 'none'}}>
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png"
                                    alt="LinkedIn"
                                    style={{
                                        height: '24px',
                                        width: 'auto',
                                        filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        padding: '4px'
                                    }}
                                />
                            </a>
                            <a href="https://instagram.com" style={{textDecoration: 'none'}}>
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg"
                                    alt="Instagram"
                                    style={{
                                        height: '24px',
                                        width: 'auto',
                                        filter: 'drop-shadow(0 2px 4px rgba(255, 255, 255, 0.3))',
                                        borderRadius: '4px',
                                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                        padding: '4px'
                                    }}
                                />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="col-lg-2 col-md-6 mb-4">
                        <h6 style={{color: '#0d6efd', marginBottom: '1rem'}}>Quick Links</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <Link to="/" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Home
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/about" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    About Us
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/products" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Products
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/pricing" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Pricing
                                </Link>
                            </li>
                            <li className="mb-2">
                                <Link to="/support" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Support
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Trading */}
                    <div className="col-lg-2 col-md-6 mb-4">
                        <h6 style={{color: '#0d6efd', marginBottom: '1rem'}}>Trading</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <a href="/trading/stocks" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Stock Trading
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/trading/options" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Options Trading
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/trading/mutual-funds" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Mutual Funds
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/trading/etfs" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    ETFs
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/trading/futures" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Futures
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div className="col-lg-2 col-md-6 mb-4">
                        <h6 style={{color: '#0d6efd', marginBottom: '1rem'}}>Support</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <a href="/help" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Help Center
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/contact" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Contact Us
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/api-docs" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    API Documentation
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/status" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    System Status
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/community" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Community
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Legal */}
                    <div className="col-lg-2 col-md-6 mb-4">
                        <h6 style={{color: '#0d6efd', marginBottom: '1rem'}}>Legal</h6>
                        <ul className="list-unstyled">
                            <li className="mb-2">
                                <a href="/privacy" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Privacy Policy
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/terms" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Terms of Service
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/risk-disclosure" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Risk Disclosure
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/cookies" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Cookie Policy
                                </a>
                            </li>
                            <li className="mb-2">
                                <a href="/compliance" style={{color: '#6c757d', textDecoration: 'none'}}>
                                    Compliance
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Newsletter Signup */}
                <div className="row mt-4 pt-4" style={{borderTop: '1px solid #6c757d'}}>
                    <div className="col-lg-6 mb-3">
                        <h6 style={{color: '#0d6efd', marginBottom: '0.5rem'}}>Stay Updated</h6>
                        <p style={{color: '#6c757d', fontSize: '0.875rem', marginBottom: '1rem'}}>
                            Get the latest market insights and trading tips delivered to your inbox.
                        </p>
                        <div className="d-flex gap-2">
                            <input 
                                type="email" 
                                className="form-control form-control-sm" 
                                placeholder="Enter your email"
                                style={{maxWidth: '250px'}}
                            />
                            <button className="btn btn-primary btn-sm">
                                Subscribe
                            </button>
                        </div>
                    </div>
                    <div className="col-lg-6 mb-3">
                        <h6 style={{color: '#0d6efd', marginBottom: '0.5rem'}}>Download Our App</h6>
                        <p style={{color: '#6c757d', fontSize: '0.875rem', marginBottom: '1rem'}}>
                            Trade on the go with our mobile app.
                        </p>
                        <div className="d-flex gap-2">
                            <a href="https://apps.apple.com" className="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
                                <img 
                                    src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                                    alt="Download on the App Store"
                                    style={{
                                        height: '20px',
                                        width: 'auto'
                                    }}
                                />
                            </a>
                            <a href="https://play.google.com" className="btn btn-outline-light btn-sm d-flex align-items-center gap-2">
                                <img 
                                    src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                                    alt="Get it on Google Play"
                                    style={{
                                        height: '20px',
                                        width: 'auto'
                                    }}
                                />
                            </a>
                        </div>
                    </div>
                </div>
                
                {/* Bottom Bar */}
                <div className="row mt-4 pt-3" style={{borderTop: '1px solid #6c757d'}}>
                    <div className="col-md-6">
                        <p style={{color: '#6c757d', fontSize: '0.875rem', marginBottom: '0'}}>
                            &copy; 2024 Hytrade. All rights reserved.
                        </p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <p style={{color: '#6c757d', fontSize: '0.875rem', marginBottom: '0'}}>
                            🛡️ Secured by 256-bit SSL encryption
                        </p>
                    </div>
                </div>

                {/* Disclaimer */}
                <div className="row mt-3">
                    <div className="col-12">
                        <p style={{color: '#6c757d', fontSize: '0.875rem', textAlign: 'center'}}>
                            <strong>Risk Warning:</strong> Trading involves substantial risk of loss and is not suitable for all investors. 
                            Past performance is not indicative of future results. Please consider your investment objectives and risk tolerance before trading.
                        </p>
                    </div>
                </div>
        </div>
        </footer>
     );
}

export default Footer;