import React from 'react';

function Main (){
    return ( 
        <div className='container'>
            <div className='row '>
                <div className='col-6 p-5 text-center text-muted' >
                    <img src='media/Images/' style={{borderRadius:"200%",width:"60%"}}/>
                    <h4>Satendra soraiya</h4>
                   

                </div>
                <div className='col-6 text-center p-5'>
                     <h2>About me</h2>
                    <p>I'm a web developer.
                        A programmer with good knowledge of front-end techniques.
                    </p>

                </div>
            </div>
        </div>

     );
}

export default Main ;