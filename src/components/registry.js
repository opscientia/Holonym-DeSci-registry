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

const Registry = (props) => {
    return <>
            <div class="x-section bg-img wf-section" style={{width:'100vw', height:'100vh'}}>
                <div className="x-container w-container">
                    <div className="x-wrapper fullscreen-center" style={{marginLeft:'1.5vw', marginLeft:'1.5vw'}}>
                        <h1>DeSci Ape Yacht Club</h1>
                        <Wrapper>
                            {cards.map(x => <SmallCard holo={x} />)}
                        </Wrapper>
                    </div>
                </div>
            </div>
         </>
}
export default Registry;