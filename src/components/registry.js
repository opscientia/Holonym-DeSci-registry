import React, { useState, useEffect } from 'react'
import { SmallCard } from './cards.js'

// Wraps everything on the registry screen with style
const Wrapper = (props) => {
    return <>
    <div class="slider-container" style={{width:'100vw'}}>
        <div class="slider-wrapper">
        {props.children}
            </div>
        </div>
    
    <div class="spacer-small"></div>
    </>
    
}
const cards = [
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },{
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
    {
        name: 'Vitalik Buterin',
        bio: 'Interested in DeSci, Marine Biology, and Gardening',
        twitter: 'VitalikButerin',
        google: '',
        github: 'opscientia',
        orcid: '0000-6969-6969'
    },
]

const CardGrid = () => {
    let outputElements = []
    // Split the cards into chunks for row length 3
    let rowLength = 3;
    for (let i = 0; i < cards.length; i += rowLength){
        outputElements.push(
            <Wrapper>
                {cards.slice(i, i + rowLength).map(x => <SmallCard holo={x} />)}
            </Wrapper>
        )
    }
    console.log(outputElements.length, 'OUTPUT ELEMENTS')
    return outputElements
}
const Registry = (props) => {
    return <>
            <div class="x-section bg-img wf-section" style={{width:'100vw', height:'100vh'}}>
                <div className="x-container w-container">
                    <div className="x-wrapper fullscreen-center" style={{marginLeft:'1.5vw', marginLeft:'1.5vw'}}>
                        <h1>DeSci Reg</h1>
                        <CardGrid />
                    </div>
                </div>
            </div>
         </>
}
export default Registry;