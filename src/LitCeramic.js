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

// const accessControlConditions = [{
//     contractAddress: '',
//     standardContractType: '',
//     chain: 'mumbai',
//     method: 'eth_getBalance',
//     parameters: [
//       ':userAddress',
//       'latest'
//     ],
//     returnValueTest: {
//       comparator: '>=',
//       value: '1'
//     }
//   }]



// const evmContractConditions = [
//     {
//         contractAddress: contractAddresses['google'],
//         functionName: 'hasAccess',
//         functionParams: [
//             '0xC8834C1FcF0Df6623Fc8C8eD25064A4148D99388',
//             '0xC8834C1FcF0Df6623Fc8C8eD25064A4148D99388',
//             ],
//         functionAbi: {
//             "inputs": [
//               {
//                 "internalType": "address",
//                 "name": "owner",
//                 "type": "address"
//               },
//               {
//                 "internalType": "address",
//                 "name": "viewer",
//                 "type": "address"
//               }
//             ],
//             "name": "hasAccess",
//             "outputs": [
//               {
//                 "internalType": "bool",
//                 "name": "result",
//                 "type": "bool"
//               }
//             ],
//             "stateMutability": "view",
//             "type": "function"
//           },
//         returnValueTest: {
//             key: "result",
//             comparator: "=",
//             value: "true"
//         }
//     }
// ]



const evmContractConditions = [
    {
      contractAddress: "0x1362fe03c3c338f2e7dfaA44205f2B047f2C430D",
      functionName: "hasAccess",
      functionParams: [":userAddress",":userAddress"],
      functionAbi: {
        "inputs": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "viewer",
            "type": "address"
          }
        ],
        "name": "hasAccess",
        "outputs": [
          {
            "internalType": "bool",
            "name": "result",
            "type": "bool"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      chain: "mumbai",
      returnValueTest: {
        key: "result",
        comparator: "=",
        value: "true",
      },
    },
  ];

const stringToEncrypt = 'This is what we want to encrypt on Lit and then store on ceramic'
// Changes to's access to newState (true or false)
const changeAccess = async (to, newState) => {
    console.log(contractAddresses['google'])
    let vjwt = new ethers.Contract(contractAddresses['google'], abi, signer)
    vjwt.setAccess(to, newState)
}

export const LitCeramic = (props)=> {
    const [streamID, setStreamID] = useState(null)
    const [streamContent, setStreamContent] = useState(null)
    const [account, setAccount] = useState(null)
    const [self, setSelf] = useState(null)
    const [buttonPressed, setButtonPressed] = useState(0) // this should be incremented (or somehow changed) on every button press so it triggers a useEffect
    // get ethereum account
    window.ethereum.request({
    method: 'eth_requestAccounts',
    })
    .then(accounts=>setAccount(accounts[0]))

    // upload content to stream when page loads
    const uploadPrivateCredentials = ()=>{
        litCeramicIntegration.encryptAndWrite(stringToEncrypt, evmContractConditions, 'evmContractConditions').then(streamID => setStreamID(streamID))
    }

    // load stream from ceramic when streamID changes
    useEffect(()=>{
        if(streamID){
            litCeramicIntegration.readAndDecrypt(streamID).then(c=>setStreamContent(c))
            let vjwt = new ethers.Contract(contractAddresses['google'], abi, signer)
            console.log(account)
            vjwt.hasAccess('0xC8834C1FcF0Df6623Fc8C8eD25064A4148D99388',
            '0xC8834C1FcF0Df6623Fc8C8eD25064A4148D99388',).then(x=>console.log('HAS AXIS ', x))
        }
    }, [streamID, buttonPressed])

    return <>
        <button onClick={async ()=> await changeAccess(account, true)}>Grant Me Access</button>
        <button onClick={async ()=> await changeAccess(account, false)}>Revoke My Access</button>
        <button onClick={uploadPrivateCredentials}>Upload Private Credentials</button>
        <button onClick={()=>setButtonPressed( buttonPressed +1 ) }>View Credentials</button>
        {streamID ? `Saved to streamID ${streamID} ,` : null} 
        <i>Content :</i>{streamContent}
    </>
}