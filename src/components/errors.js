import React from 'react';

const Error = (props) => {
    return <div className='bg-img x-section wf-section' style={{width:'100vw'}}>
                <div className="x-container w-container" style={{display : "block"}}>
                    <h3 className="h3">Error</h3>
                    <p style={{color: "red"}}>{props.msg}</p>
                </div>
            </div>
}
export default Error;