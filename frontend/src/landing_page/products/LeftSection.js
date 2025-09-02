import React from 'react';
function LeftSection({imageURL,productName,productDescription,tryDemo,LearnMore,googlePlay,appStore}){
    return ( 
        <div className='conatiner'>
            <div className='row ms-5'>
                <div className='col-6 '>
                        <img src={imageURL}/>
                    </div>
                    <div className='col-6 p-5'>
                        <h1>{productName}</h1>
                        <p>{productDescription}</p>
                        <div>
                        <a href={tryDemo}>Try Demo</a>
                        <a href={LearnMore} style={{marginLeft:"50px"}}>Learn More</a>
                        </div>
                        <div className='mt-3'>
                        <a href={googlePlay}><img src='media/Images/googlePlayBadge.svg'/></a>
                        <a href={googlePlay}><img src='media/Images/appstoreBadge.svg'/></a>
                        </div>
                    </div>

                </div>
            </div>
        
        
     );
}

export default LeftSection;