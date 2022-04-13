import React, { useState, useEffect } from 'react'
import { SmallCard } from './cards.js'
import { SearchBar } from './search-bar.js'


const wtf = require('wtf-lib')


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

const defaultHolo = {
    name: '',
    bio: '',
    twitter: '',
    google: '',
    github: '',
    orcid: ''
}



const Registry = (props) => {
    const getAllHolos = async () => {
        await wtf.setProviderURL({polygon : 'https://rpc-mumbai.maticvigil.com'})
        const allAddressesByService = (await wtf.getAllUserAddresses())[props.desiredChain]
        let allAddresses = []
        for (const [service, addresses] of Object.entries(allAddressesByService)){
            allAddresses = [...new Set([...allAddresses, ...addresses])]
        }
        console.log('WHAT IS THIS', allAddresses)
        const allHolos = allAddresses.map(async (address) => {
            let holo_ = (await wtf.getHolo(address))[props.desiredChain]
            return {...defaultHolo, ...holo_.creds, 'name' : holo_.name || 'Anonymous', 'bio' : holo_.bio || 'No information provided'}
        })
        return Promise.all(allHolos)
    }
    const updateHolos = async () => setHolos(await getAllHolos())
    const [holos, setHolos] = useState([])
    useEffect(updateHolos, [])
    console.log(holos)
    return <>
            <div class="x-section bg-img wf-section" style={{height:'200vw'}}>
                <div className="x-container w-container">
                    <div className="x-wrapper fullscreen-center" style={{marginLeft:'1.5vw', marginLeft:'1.5vw'}}>
                        <h1>DeSci Ape Yacht Club</h1>
                        <div className="x-wrapper small-center">
                            <SearchBar />
                            <div class="spacer-large"></div>
                        </div>
                        <Wrapper>
                            {holos.map(x => <SmallCard holo={x} />)}
                        </Wrapper>
                    </div>
                </div>
            </div>
         </>
}
export default Registry;