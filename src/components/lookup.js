import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { truncateAddress } from '../ui-helpers';
import contractAddresses from '../contractAddresses.json'
import abi from '../abi/VerifyJWT.json'
import { InfoButton } from './info-button';
import { SearchBar } from './search-bar';
import Github from '../img/Github.svg';
import Google from '../img/Google.svg';
import CircleWavy from '../img/CircleWavy.svg';
import CircleWavyCheck from '../img/CircleWavyCheck.svg';
import Orcid from '../img/Orcid.svg';
import TwitterLogo from '../img/TwitterLogo.svg';
import profile from '../img/profile.svg'
import { lookup } from 'dns';
// import ToggleButton from 'react-bootstrap/ToggleButton'
// import ButtonGroup from 'react-bootstrap/ButtonGroup'
// import 'bootstrap/dist/css/bootstrap.css';

const icons = {
    google : Google,
    github : Github,
    orcid : Orcid,
    twitter : TwitterLogo

}
const { ethers } = require('ethers');  

const wtf = require('wtf-lib');
wtf.setProviderURL({polygon : 'https://rpc-mumbai.maticvigil.com'});

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

// Looks up and displays user Holo
const Holo = (props) => {
    const [holo, setHolo] = useState({
        name: 'Anonymous',
        bio: 'No information provided',
        twitter: '',
        google: '',
        github: '',
        orcid: ''
    })

    useEffect(async () => {
        // if address is supplied, address is lookupBy. Otherwise, we have to find address by getting addressForCredentials(lookupby)
        let address = props.service == 'address' ? props.lookupBy : await wtf.addressForCredentials(props.lookupBy, props.service.toLowerCase())
        console.log('address', address)
        console.log('0xb1d534a8836fB0d276A211653AeEA41C6E11361E' == address)
        let holo_ = (await wtf.getHolo(address))[props.desiredChain]
        console.log('holo', holo_)
  
        setHolo({...holo, ...holo_.creds, 'name' : holo_.name, 'bio' : holo_.bio})
      }, [props.desiredChain, props.provider, props.account]);
      
    return <div class="x-card">
    <div class="id-card profile">
      <div class="id-card-1"><img src={profile} loading="lazy" alt="" class="id-img" /></div>
      <div class="id-card-2">
        <div class="id-profile-name-div">
          <h3 id="w-node-_0efb49bf-473f-0fcd-ca4f-da5c9faeac9a-4077819e" class="h3 no-margin">{holo.name}</h3>
        </div>
        <div class="spacer-xx-small"></div>
        <p class="id-designation">{holo.bio}</p>
      </div>
    </div>
    <div class="spacer-small"></div>
    {/* <div class="card-heading">
      <h3 class="h3 no-margin">Profile Strength</h3>
      <div class="v-spacer-small"></div>
      <h3 class="h3 no-margin active">Pro</h3>
      <InfoButton text='Profile Strength is stronger the more accounts you have, the more recently you link the accounts, and greater your social activity metrics (e.g., number of friends, followers, repositories, etc.)' />
    </div> */}
    <div class="spacer-small"></div>
    {Object.keys(holo).map(k => {
        if(k != 'name' && k != 'bio') {
            return <>
                <div class="card-text-div"><img src={icons[k]} loading="lazy" alt="" class="card-logo" />
                    <div class="card-text">{holo[k] || 'Not listed'}</div>
                    <img src={holo[k] ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" class="id-verification-icon" />
                </div>
                <div class="spacer-x-small"></div>
            </>
        }
    })}
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

    try {
        const vjwt = new ethers.Contract(contractAddresses[params.web2service], abi, props.provider)
        console.log(contractAddresses[params.web2service])
        vjwt.addressForCreds(Buffer.from(params.credentials)).then(addr=>setAddress(addr))
    } catch(e) {
        console.log(e)
    }
    
    return <Wrapper>
                    <SearchBar />
                    <div class="spacer-large"></div>
                    {address == '0x0000000000000000000000000000000000000000' ? <p>No address with these credentials was found on Polygon testnet</p> : 
                    <>
                        <Holo {...props} lookupBy={params.credentials} service={params.web2service} />
                        <div class="spacer-medium"></div>
                        <div class="btn-wrapper">
                            {/* <a href="/lookup" class="x-button primary outline">search again</a> */}
                            <a onClick={()=>sendCrypto(props.provider.getSigner(), address)} class="x-button primary">Pay {params.web2service == 'address' ? truncateAddress(params.credentials) : params.credentials}</a>
                        </div>
                    </>}
                </Wrapper>
        
    
}