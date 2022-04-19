import React, { useState, useEffect } from 'react'
import { SmallCard } from './cards.js'
import { SearchBar } from './search-bar.js'
import { Modal } from './modals.js'
import { useNavigate  } from 'react-router-dom'
import wtf from '../wtf-configured'


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

const defaultHolo = {
    name: '',
    bio: '',
    twitter: '',
    google: '',
    github: '',
    orcid: ''
}

let hasBeenRun = false

const Registry = (props) => {
    const getAllAddresses = async () => {
        const allAddressesByService = (await wtf.getAllUserAddresses())[props.desiredChain]
        let allAddresses = []
        for (const [service, addresses] of Object.entries(allAddressesByService)){
            allAddresses = [...new Set([...allAddresses, ...addresses])]
        }
        return allAddresses
    }

    // can optionally supply addresses to get holos from. otherwise, gets from all addresses registered on Holo:
    const getAllHolos = async (addresses) => {
        let allAddresses = addresses || (await getAllAddresses())
        console.log('WHAT IS THIS', allAddresses)
        const allHolos = allAddresses.map(async (address) => {
            wtf.setProviderURL({ 'gnosis' : 'https://xdai-rpc.gateway.pokt.network' })
            let holo_ = (await wtf.getHolo(address))[props.desiredChain]
            console.log('one holo is ', address, await wtf.getHolo(address))
            return {...defaultHolo, ...holo_.creds, 'name' : holo_.name || 'Anonymous', 'bio' : holo_.bio || 'No information provided'}
        })
        console.log(allHolos, 'ARE ALL OF DHE HOLOS')
        return Promise.all(allHolos)
    }

    const init = async () => {
        if(!props.provider || hasBeenRun){return}
        hasBeenRun = true
        try{
            console.log('THIS RAN')
            let addresses = await getAllAddresses()
            console.log('ALL ADDRESSES', addresses)
            let allHolos = await getAllHolos(addresses)
            console.log('ALL HOLOS', allHolos)
            setHolos(allHolos)
            // Only show the modal if the user doesn't have a Holo: 
            let address = props.address || await props.provider.getSigner().getAddress()
            if(addresses.includes(address)){setModalVisible(false)}
        } catch(err) {
            console.log('ERROR: ', err)
        }
        
    }
    const [holos, setHolos] = useState([])
    const [modalVisible, setModalVisible] = useState(true)
    useEffect(init, [props.provider])

    console.log(holos)

    const navigate = useNavigate()

    
    return <>
            <div class="x-section bg-img wf-section" style={{height:'200vw'}}>
                <div className="x-container w-container">
                    <div className="x-wrapper fullscreen-center" style={{marginLeft:'1.5vw', marginLeft:'1.5vw'}}>
                        <h1>DeSci Community</h1>
                        <div className="x-wrapper small-center">
                            <SearchBar />
                            <div class="spacer-large"></div>
                        </div>
                        <Wrapper>
                            {holos.length ? holos.map(x => <SmallCard holo={x} />) : null}
                        </Wrapper>
                        <Modal visible={modalVisible} setVisible={()=>{}} blur={true}>
                            {holos.length ? <>
                                <h3 className="h3 white">Create your own identity to join the community</h3>
                                <div className='x-container w-container' style={{justifyContent: 'space-between'}}>
                                    <a onClick={()=>navigate('/myholo')} className='x-button' style={{width: '45%'}}>Create My ID</a> 
                                    <a href='https://holo.pizza' className='x-button secondary' style={{width: '45%'}}>Learn More</a>
                                </div>
                            </> : <h3 className="h3 white">Loading data from smart-contracts...</h3>}
                        </Modal>
                    </div>
                </div>
            </div>
         </>
}
export default Registry;