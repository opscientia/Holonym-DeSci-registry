import React, { useState, useEffect } from 'react'
import { Integration } from 'lit-ceramic-sdk'
import contractAddresses from './contractAddresses.json'
import abi from './abi/VerifyJWT.json'
import { providers } from 'ethers'
const { ethers } = require('ethers')


const provider = new ethers.providers.Web3Provider(window.ethereum)
const signer = provider.getSigner()

let litCeramicIntegration = new Integration('https://ceramic-clay.3boxlabs.com', 'mumbai')
litCeramicIntegration.startLitClient(window)

// const accessControlConditions = [
//     {
//         contractAddress: contractAddresses['google'],
//         standardContractType: '',
//         chain: 'avalanche',
//         method: 'hasAccess',
//         parameters: [
//         ':userAddress',
//         ],
//         returnValueTest: {
//         comparator: '=',
//         value: 'true'
//         }
//     }
// ]

// const accessControlConditions = [
//     {
//         contractAddress: contractAddresses['google'],
//         standardContractType: '',
//         chain: 'mumbai',
//         method: 'hasAccess',
//         parameters: [
//         ':userAddress',
//         ],
//         returnValueTest: {
//         comparator: '=',
//         value: 'true'
//         }
//     }
// ]

const accessControlConditions = [{
    contractAddress: '',
    standardContractType: '',
    chain: 'mumbai',
    method: 'eth_getBalance',
    parameters: [
      ':userAddress',
      'latest'
    ],
    returnValueTest: {
      comparator: '>=',
      value: '1'
    }
  }]

const stringToEncrypt = 'This is what we want to encrypt on Lit and then store on ceramic'

const grantAccess = async (to) => {
    let vjwt = new ethers.Contract(contractAddresses['google'], abi, signer)
    vjwt.setAccess(to, true)
}

export const LitCeramic = (props)=> {
    const [streamID, setStreamID] = useState(null)
    const [streamContent, setStreamContent] = useState(null)
    const [account, setAccount] = useState(null)
    const [self, setSelf] = useState(null)
    // get ethereum account
    window.ethereum.request({
    method: 'eth_requestAccounts',
    })
    .then(accounts=>setAccount(accounts[0]))

    // upload content to stream when page loads
    const uploadPrivateCredentials = ()=>{
        litCeramicIntegration.encryptAndWrite(stringToEncrypt, accessControlConditions).then(streamID => setStreamID(streamID))
    }

    // load stream from ceramic when streamID changes
    useEffect(()=>{
        if(streamID){
            litCeramicIntegration.readAndDecrypt(streamID).then(c=>setStreamContent(c))
            console.log('NOODLE')
            console.log(streamID)
        }
    }, [streamID])
    return <>
        <button onClick={async ()=> await grantAccess(account)}>Grant Me Access</button>
        <button onClick={uploadPrivateCredentials}>Upload Private Credentials</button>
        {streamID ? `Saved to streamID ${streamID} ,` : null} 
        <i>Content :</i>{streamContent}
    </>
}