import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { truncateAddress } from '../ui-helpers';
import contractAddresses from '../contractAddresses.json'
import contractAddressesNew from '../contractAddressesNew.json' // TODO: collapse contractAddresses and contractAddressesNew into one
import abi from '../abi/VerifyJWT.json'
import wtfBiosABI from '../abi/WTFBios.json'
import idAggABI from '../abi/IdentityAggregator.json'
import { InfoButton } from './info-button';
import { SearchBar } from './search-bar';
import Github from '../img/Github.svg';
import Google from '../img/Google.svg';
import CircleWavy from '../img/CircleWavy.svg';
import CircleWavyCheck from '../img/CircleWavyCheck.svg';
import Orcid from '../img/Orcid.svg';
import TwitterLogo from '../img/TwitterLogo.svg';
import profile from '../img/profile.svg';
import { linkFor } from '../link-for.js';
import wtf from '../wtf-configured'

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


const sendCrypto = (provider, to) => {
    if(!provider || !to) {
        alert('Error: Please connect your wallet, set it to the right network, and specify a recipient')
    } else {
        provider.getSigner().sendTransaction({
            to: to,
            // Convert currency unit from ether to wei
            value: ethers.utils.parseEther('.1')
        })
    }
    
}

// Wraps everything on the lookup screen with style
const Wrapper = (props) => {
    // return <div class="x-section bg-img wf-section" style={{width:'100vw', height:'100vh'}}>
    return <div class="x-section bg-img wf-section" >
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
        address: '',
        name: 'Anonymous',
        bio: 'No information provided',
        twitter: '',
        google: '',
        github: '',
        orcid: ''
    })

    useEffect(async () => {
      if (props.filledHolo) {
        setHolo(props.filledHolo)
      } else {
        // if address is supplied, address is lookupBy. Otherwise, we have to find address by getting addressForCredentials(lookupby)
        let address = props.service == 'address' ? props.lookupBy : await wtf.addressForCredentials(props.lookupBy, props.service.toLowerCase())
        console.log('address', address)
        console.log('0xb1d534a8836fB0d276A211653AeEA41C6E11361E' == address)
        let holo_ = (await wtf.getHolo(address))[props.desiredChain]
        setHolo({...holo, ...holo_.creds, 'name' : holo_.name, 'bio' : holo_.bio})
      }
    }, [props.filledHolo, props.desiredChain, props.provider, props.account]);
      
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
        if(!['name', 'bio', 'address', 'discord'].includes(k)) { //ignore discord too for now
            return <>
                <a style={{textDecoration: 'none'}} href={linkFor(k, holo[k])}>
                  <div class="card-text-div"><img src={icons[k]} loading="lazy" alt="" class="card-logo" />
                      <div class="card-text">{holo[k] || 'Not listed'}</div>
                      <a>
                        <img src={holo[k] ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" class="id-verification-icon" />
                      </a>
                  </div>
                </a>
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

    if (params.web2service.includes('namebio')) {
      return (
        <>
          <Wrapper>
            <SearchBar />
            <SearchedHolos searchStr={params.credentials} desiredChain={props.desiredChain} provider={props.provider} {...props} />
          </Wrapper>
        </>
      )
    }
    // Find the user's address
    if(props.service == 'address') {
      setAddress(props.lookupBy) 
    } else {
      wtf.addressForCredentials(props.lookupBy, params.web2service.toLowerCase()).then(addr=>setAddress(addr))
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
                            {/* Only demo the payment feature when looking up by email, orcid, etc. address isn't interesting */}
                            {params.web2service != 'address' ? 
                                <a onClick={()=>sendCrypto(props.provider, address)} class="x-button primary">Pay {params.credentials}</a>
                                : 
                                null 
                            }
                        </div>
                    </>}
                </Wrapper>
        
    
}

export const SearchedHolos = (props) => {
  const [userHolos, setUserHolos] = useState([])
  const [loading, setLoading] = useState(true)

  async function getHolos() {
    console.log('Provier...', props.provider)
    setLoading(true)

    // Get all addresses with name/bio
    console.log('Entered getHolos in lookup.js')
    let url = 'https://sciverse.id/getAllUserAddresses'
    let response = await fetch(url)
    const addrsObj = await response.json() // TODO: try-catch. Need to catch timeouts and such
    const addrsWithNameOrBio = addrsObj['allAddrs'][props.desiredChain]['nameAndBio'] 
  
    console.log('addrsWithNameOrBio...', addrsWithNameOrBio)

    // Get all creds of every account with a name/bio that includes search string
    let allHolos = []
    for (const address of addrsWithNameOrBio) {
      // TODO: Remove the following check when new bio contract is deployed!!
      let viewedAddrs = allHolos.map(holo => holo.address)
      if (viewedAddrs.indexOf(address) != -1) {
        continue;
      }

      console.log('Getting holo for address...', address)
      url = `https://sciverse.id/getHolo?address=${address}`
      response = await fetch(url) // TODO: try-catch. Need to catch timeouts and such
      let holoData = await response.json()
      holoData = holoData['holo'][props.desiredChain]

      let name = holoData['name']
      let bio = holoData['bio']
      if (name.toLowerCase().includes(props.searchStr.toLowerCase()) || bio.toLowerCase().includes(props.searchStr.toLowerCase())) {
        let creds = holoData['creds']
        let holoTemp = {
          'address': address,
          'name': name,
          'bio': bio,
          ...creds
        }
        allHolos.push(holoTemp)
      }
    }
    const userHolosTemp = allHolos.map(userHolo => (
      <div key={userHolo.address}>
        <div class="spacer-small"></div>
        <Holo filledHolo={userHolo} {...props} />
      </div>
    ))
    return userHolosTemp
  }

  useEffect(() => {
    getHolos().then(userHolosTemp => {
      setUserHolos(userHolosTemp)
      setLoading(false)
    })
  }, [props.searchStr]) // searchStr == what the user inputed to search bar

  return (
    <>
      {loading ? <p>Loading...</p> : userHolos}
    </>
  )
}