import React, { useState, useEffect } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import contractAddresses from '../contractAddresses.json'
import abi from '../abi/VerifyJWT.json'
// import ToggleButton from 'react-bootstrap/ToggleButton'
// import ButtonGroup from 'react-bootstrap/ButtonGroup'
// import 'bootstrap/dist/css/bootstrap.css';

const { ethers } = require('ethers');  
  
const SearchBar = () => {
    // const searchBarStyle = {
    //     height : '45px',
    //     width : '364px',
    //     color: 'grey',
    //     fontSize: '19px',
    //     background : 'transparent',
    //     border : 'none',
    // }
    // const searchButtonStyle = {
    //     height : '45px',
    //     width : '45px',
    //     background : 'yellow',
    //     color: 'grey',
    //     fontSize: '19px',
    //     border : 'none',
    //     // borderLeft : '5px dotted grey',
        
    // }
    let navigate = useNavigate()
    let params = useParams()
    let [credentials, setCredentials] = useState('')
    // let [web2service, setWeb2Service] = useState(params.web2service)
    // const toggles = [
    //     { name: 'Google', value: 'google' },
    //     { name: 'ORCID', value: 'orcid' },
    //   ];

    const search = () => {
        let web2Service = null;

        if(credentials.startsWith('@')){
            web2Service = 'Twitter'
        } else if(credentials.includes('@')){
            web2Service = 'Google'
        } else if(credentials.includes('-')){
            web2Service = 'ORCID'
        }
        navigate(`/lookup/${web2Service}/${credentials}`)
    }
    return <>
            {/* <ButtonGroup>
                {toggles.map((toggle, idx) => (
                <ToggleButton
                    key={idx}
                    id={`radio-${idx}`}
                    type="radio"
                    variant={idx % 2 ? 'outline-success' : 'outline-danger'}
                    name='radio'
                    value={toggle.value}
                    checked={web2service === toggle.value}
                    onChange={(e) => setWeb2Service(e.currentTarget.value)}
                >
                    {toggle.name}
                </ToggleButton>
                ))}
            </ButtonGroup> */}
            {/* <span style={{border:'5px dotted grey'}}>
                <input placeholder='Search for someone' value={credentials} onChange={e=>setCredentials(e.target.value)} style={searchBarStyle} />
                <button onClick={()=>navigate(`/lookup/${web2service}/${credentials}`)} style={searchButtonStyle}>Go</button>
            
            </span> */}

        <div class="optin-form w-form">
            {/* TODO : this need not be a <form />*/}
          <form id="email-form" name="email-form" data-name="Email Form" method="get" class="form">
              <input onChange={e=>setCredentials(e.target.value)} type="email" class="text-field w-input" maxLength="256" name="email-3" data-name="Email 3" placeholder="Discover others by email, Twitter, etc." id="email-3" required="" />
            </form>
        </div>
        <div class="spacer-small"></div>
        <div class="btn-wrapper">
          <a onClick={search} class="x-button w-button">search now</a>
          <div class="v-spacer-small"></div>
          <div class="spacer-small mobile"></div>
          <a href="#" class="x-button secondary outline w-button">learn more</a>
        </div>
        <div class="spacer-large"></div>
        </>
}
const sendCrypto = (signer, to) => {
    if(!signer || !to) {
        alert('Error! make sure MetaMask is set to Avalanche C testnet and you specify a recipient')
    } else {
        signer.sendTransaction({
            to: to,
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther('.1')
        })
    }
    
}

// Wraps everything on the lookup screen with style
const Wrapper = (props) => {
    return <div class="x-section bg-img wf-section" style={{width:'100vw', height:'100vh'}}>
                <div className="x-container w-container">
                    <div className="x-wrapper small-center">
                        {props.children}
                    </div>
                </div>
            </div>
}

//   MAKE SURE NETWORK IS SET TO THE RIGHT ONE (AVALANCHE C TESTNET)
export const Lookup = (props) => {
    const [address, setAddress] = useState(null)
    let params = useParams()
    // if the URL is just /lookup or something malformed, just return the search bar
    if (!params.web2service || !params.credentials) {
        return <Wrapper><SearchBar /></Wrapper>
    }
    const vjwt = new ethers.Contract(contractAddresses[params.web2service], abi, props.provider)
    console.log(contractAddresses[params.web2service])
    vjwt.addressForCreds(Buffer.from(params.credentials)).then(addr=>setAddress(addr))
    return <Wrapper>
                    <SearchBar />
                    {address == '0x0000000000000000000000000000000000000000' ? 'No address with these credentials was found on Avalanche testnet' : 
                    <>
                        <p><b>{params.credentials}</b> is {address}</p>
                        <button onClick={()=>sendCrypto(props.provider.getSigner(), address)}
                                style={{color: 'grey', fontSize: '14px', background: 'yellow', border: 'none'}}>
                            Send some $$$ to <b>{params.credentials}</b>
                        </button>
                    </>}
                </Wrapper>
        
    
}