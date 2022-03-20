import React, { useState, useEffect } from 'react'
import { useParams, Navigate, useNavigate } from 'react-router-dom'
import contractAddresses from './contractAddresses.json'
import abi from './abi/VerifyJWT.json'

const { ethers } = require('ethers');

const SearchBar = () => {
    const searchBarStyle = {
        height : '45px',
        width : '364px',
        color: 'grey',
        fontSize: '19px',
        background : 'transparent',
        border : 'none',
    }
    const searchButtonStyle = {
        height : '45px',
        width : '45px',
        background : 'yellow',
        color: 'grey',
        fontSize: '19px',
        border : 'none',
        // borderLeft : '5px dotted grey',
        
    }
    let navigate = useNavigate()
    let [credentials, setCredentials] = useState(null)
    return <span style={{border:'5px dotted grey'}}>
                <input placeholder='Search for someone' value={credentials} onChange={e=>setCredentials(e.target.value)} style={searchBarStyle} />
                <button onClick={()=>navigate(`/lookup/google/${credentials}`)} style={searchButtonStyle}>Go</button>
            
            </span>
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
//   MAKE SURE NETWORK IS SET TO THE RIGHT ONE (AVALANCHE C TESTNET)
export const Lookup = (props) => {
    const [address, setAddress] = useState(null)
    let params = useParams()
    // if the URL is just /lookup or something malformed, just return the search bar
    if (!params.web2service || !params.credentials) {
        return <SearchBar />
    }
    const vjwt = new ethers.Contract(contractAddresses[params.web2service], abi, props.provider)
    vjwt.addressForCreds(Buffer.from(params.credentials)).then(addr=>setAddress(addr))
    console.log(address)
    return <>
        <SearchBar />
        {address == '0x0000000000000000000000000000000000000000' ? 'No address with these credentials was found on Avalanche testnet' : 
        <>
            <p><b>{params.credentials}</b> is {address}</p>
            <button onClick={()=>sendCrypto(props.signer, address)}
                    style={{color: 'grey', fontSize: '14px', background: 'yellow', border: 'none'}}>
                Send 0.1 AVAX to <b>{params.credentials}</b>
            </button>
        </>}
    </>
        
    
}