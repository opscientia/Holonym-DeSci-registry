import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import contractAddresses from './contractAddresses.json'
import abi from './abi/VerifyJWT.json'

const { ethers } = require('ethers');

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
    console.log(params)
    const vjwt = new ethers.Contract(contractAddresses[params.web2service], abi, props.provider)
    vjwt.addressForCreds(Buffer.from(params.credentials)).then(addr=>setAddress(addr))
    console.log(address)
    return address == '0x0000000000000000000000000000000000000000' ? 'No address with these credentials was found on Avalanche testnet' : <>
            <p>{address}</p>
            <button onClick={()=>sendCrypto(props.signer, address)}>Send 0.1 AVAX to <i>{params.credentials}</i></button>
        </>
    
}