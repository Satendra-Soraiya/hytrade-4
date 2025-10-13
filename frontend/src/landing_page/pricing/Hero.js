import React from 'react';
function Hero(){
    return ( 
        <div className='conatiner text-center p-5'>
            <h2>Charges</h2>
            <h5 className='text-muted mt-3 '>List of all charges and taxes</h5>
        
        
            <div className='row text-center'>
                <div className='col-4 p-4'>
                    <img src='media/Images/pricingEquity.svg'/>
                     
                    <h2 >Free equity delivery</h2>
                    <p className='text-muted mt-3'>All equity delivery investments (NSE, BSE), are absolutely free — ₹ 0 brokerage.</p>
               
            </div>
              <div className='col-4 p-4'>
                    <img src='media/Images/intradayTrades.svg'/>
                     
                    <h2 >Intraday and F&O trades</h2>
                    <p className='text-muted mt-3'>Flat ₹ 20 or 0.03% (whichever is lower) per executed order on intraday trades across equity, currency, and commodity trades. Flat ₹20 on all option trades.</p>
               
            </div>
              <div className='col-4 p-4'>
                    <img src='media/Images/pricing0.svg'/>
                     
                    <h2 >Free direct MF</h2>
                    <p className='text-muted mt-3'>All direct mutual fund investments are absolutely free — ₹ 0 commissions & DP charges.</p>
               
            </div>
                  
            </div>
            <div className='row text-center' >
                
                 <h3>Open a HYtrade account</h3>
               <p>Modern platforms and apps, ₹0 investments, and flat ₹20 intraday and F&O trades.</p>
               <button className='p-2 btn btn-primary fs-5 mb-5' style={{width:"20%",margin:"0 auto"}}>Sign up Now</button>

           </div>
            
        </div>
     );
}

export default Hero;