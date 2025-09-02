import React from 'react';
function RightSection({imageURL,productName,productDescription,LearnMore,KiteConnect}){
    return ( 
        <div className='conatiner mt-5'>
            <div className='row ms-5'>
               
                    <div className='col-6 p-5 mt-5 '>
                        <h1>{productName}</h1>
                        <p>{productDescription}</p>
                        <div>
                        
                        <a href={LearnMore} >Learn More</a>
                       
                        </div>
                      

                    </div>
                     <div className='col-6  '>
                        <img src={imageURL}/>
                    </div>

                </div>
            </div>
        
        
     );
}

export default RightSection;