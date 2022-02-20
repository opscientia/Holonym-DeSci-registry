import logo from './logo.svg';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import { GoogleLogin } from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

const responseGoogle = (response) => {
  console.log(response);
}
const responseFacebook = (response) => {
  console.log(response);
}

const { ethers } = require('ethers');
const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const abi = [
  "constructor(uint256,bytes)",
  "event JWTVerification(bool)",
  "event KeyAuthorization(bool)",
  "event modExpEventForTesting(bytes)",
  "function XOR(uint256,uint256) pure returns (uint256)",
  "function _verifyJWT(uint256,bytes,bytes,bytes) returns (bool)",
  "function addressForCreds(string) view returns (address)",
  "function addressToBytes(address) pure returns (bytes)",
  "function bytes32ToUInt256(bytes32) pure returns (uint256)",
  "function bytesToFirst32BytesAsBytes32Type(bytes) pure returns (bytes32)",
  "function bytesToLast32BytesAsBytes32Type(bytes) pure returns (bytes32)",
  "function checkJWTProof(address,string) view returns (bool)",
  "function commitJWTProof(bytes32,bytes32)",
  "function credsForAddress(address) view returns (string)",
  "function e() view returns (uint256)",
  "function jwtProofs(bytes32) view returns (uint256, bytes32)",
  "function modExp(bytes,uint256,bytes) returns (bytes)",
  "function n() view returns (bytes)",
  "function pendingVerification(uint256) view returns (bytes32)",
  "function stringToBytes(string) pure returns (bytes)",
  "function testAddressByteConversion(address) pure returns (bool)",
  "function testSHA256OnJWT(string) pure returns (bytes32)",
  "function verifiedUsers(uint256) view returns (bytes32)",
  "function verifyJWT(bytes,string) returns (bool)",
  "function verifyMe(bytes,string)"
]

const vjwt = new ethers.Contract('0x02D725e30B89A9229fe3Cd16005226f7A680601B', abi, signer);
// var jwt = require('jsonwebtoken');
let pendingProofPopup = false; 

const apiRequest = (authCode)=>{
  var url = "https://orcid.org/oauth/token";
  
    var xhr = new XMLHttpRequest();
    xhr.open("POST", url);

    xhr.setRequestHeader("Accept", "application/json");
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

    xhr.onreadystatechange = function () {
        console.log('something happened')
      if (xhr.readyState === 4) {
          console.log(xhr.status);
          console.log(xhr.responseText);
      }};

    var data = "client_id=APP-MPLI0FQRUVFEKMYX&client_secret=0c2470a1-ab05-457a-930c-487188e658e2&grant_type=authorization_code&redirect_uri=https://developers.google.com/oauthplayground&code=" + authCode;
    xhr.send(data);
}

// takes encoded JWT and returns parsed header, parsed payload, parsed signature, raw header, raw header, raw signature
const parseJWT = (JWT) => {
  if(!JWT){return null}
  let parsedToJSON = {}
  JWT.split('&').map(x=>{let [key, value] = x.split('='); parsedToJSON[key] = value});
  let [rawHead, rawPay, rawSig] = parsedToJSON['id_token'].split('.');
  let [head, pay] = [rawHead, rawPay].map(x => JSON.parse(atob(x)));
  let [sig] = [Buffer.from(rawSig.replaceAll('-', '+').replaceAll('_', '/'), 'base64')] //replaceAlls convert it from base64url to base64
  return {
    'header' :  {
      'parsed' : head,
     'raw' : rawHead,
    }, 
    'payload' :  {
      'parsed' : pay,
     'raw' : rawPay,
    }, 
    'signature' :  {
      'decoded' : sig,
     'raw' : rawSig,
    }, 
  }
}

function App() {
  // apiRequest(2000);
  
  // const orig = 'access_token=117a16aa-f766-4079-ba50-faaf0a09c864&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJwcm9kdWN0aW9uLW9yY2lkLW9yZy03aGRtZHN3YXJvc2czZ2p1am84YWd3dGF6Z2twMW9qcyIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiX1RCT2VPZ2VZNzBPVnBHRWNDTi0zUSIsImF1ZCI6IkFQUC1NUExJMEZRUlVWRkVLTVlYIiwic3ViIjoiMDAwMC0wMDAyLTIzMDgtOTUxNyIsImF1dGhfdGltZSI6MTY0NDgzMDE5MSwiaXNzIjoiaHR0cHM6XC9cL29yY2lkLm9yZyIsImV4cCI6MTY0NDkxODUzNywiZ2l2ZW5fbmFtZSI6Ik5hbmFrIE5paGFsIiwiaWF0IjoxNjQ0ODMyMTM3LCJmYW1pbHlfbmFtZSI6IktoYWxzYSIsImp0aSI6IjcxM2RjMGZiLTMwZTAtNDM0Mi05ODFjLTNlYjJiMTRiODM0OCJ9.VXNSFbSJSdOiX7n-hWB6Vh30L1IkOLiNs2hBTuUDZ4oDB-cL6AJ8QjX7wj9Nj_lGcq1kjIfFLhowo8Jy_mzMGIFU8KTZvinSA-A-tJkXOUEvjUNjd0OfQJnVVJ63wvp9gSEj419HZ13Lc2ci9CRY7efQCYeelvQOQvpdrZsRLiQ_XndeDw2hDLAmI7YrYrLMy1zQY9rD4uAlBa56RVD7me6t47jEOOJJMAs3PC8UZ6pYyNc0zAjQ8Vapqz7gxeCN-iya91YI1AIE8Ut19hGgVRa9N7l-aUielPAlzss0Qbeyvl0KTRuZWnLUSrOz8y9oGxVBCUmStEOrVrAhmkMS8A&tokenId=254337461'


  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(provider.getSigner());
  const [step, setStep] = useState(null);
  const [JWTText, setJWTText] = useState('');
  const [JWTObject, setJWTObject] = useState(''); //a fancy version of the JWT we will use for this script
  const [message, setMessage] = useState('');
  const [onChainCreds, setOnChainCreds] = useState(null);

  const signerChanged = async () => {
    let address;
    try {
      address = await signer.getAddress();
      setAccount(address);
    }
    catch (err) {
      console.log('need to login to metamask')
    }
    console.log('called signer change');
  }

  useEffect(signerChanged, [signer]);
  useEffect(signerChanged, []); //also update initially when the page loads

  useEffect(()=>setJWTObject(parseJWT(JWTText)), [JWTText]);

  const commitJWTOnChain = async (JWTObject) => {
    let message = JWTObject.header.raw + '.' + JWTObject.payload.raw
    let publicHashedMessage = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message))
    let secretHashedMessage = ethers.utils.sha256(ethers.utils.toUtf8Bytes(message))
    setMessage('It may take some time for a block to be mined. You will be prompted a second time in about 30 seconds, once the transaction is confirmed. Depending on your chain\'s finality and confirmation times, you may want to wait even longer.')
    let proof = await vjwt.XOR(secretHashedMessage, account)
    let txHash = await vjwt.commitJWTProof(proof, publicHashedMessage)
    console.log(txHash)
    provider.on(txHash, () => {setStep('waitingForBlockCompletion'); })
    // setStep('waitingForBlockCompletion')
  }

  const proveIKnewValidJWT = async (sig, message) => {
    let txHash = await vjwt.verifyMe(ethers.BigNumber.from(sig), message);
    provider.on(txHash, async () => {await setOnChainCreds(await vjwt.credsForAddress(account)); setStep('success'); })
  }

  // listen for the transaction to go to the mempool
  // provider.on('pending', async () => console.log('tx'))
  provider.on('block', async ()=>{
    if((step == 'waitingForBlockCompletion') && !pendingProofPopup){
      pendingProofPopup = true;
      await proveIKnewValidJWT(JWTObject.signature.decoded, JWTObject.header.raw + '.' + JWTObject.payload.raw)
    }
  })

  const Body = (props) => {
    switch(props.step){
      case 'success':
        console.log(onChainCreds);
        return onChainCreds ? <p class='success'>✓ You're successfully verified :) </p> : <p class='warning'>Failed to verify JWT on-chain</p>
      case 'waitingForBlockCompletion':
        return <p>Waiting for block to be mined</p>
      case 'userApproveJWT':
        return message ? message : <p>
                <h1>Confirm you're OK with this info being on-chain</h1>
                {Date.now() / 1000 > JWTObject.payload.parsed.exp ? <p class='success'>JWT is expired ✓ (that's a good thing)</p> : <p class='warning'>WARNING: Token is not expired. Submitting it on chain is dangerous</p>} Header
                <br />
                <code>{Object.keys(JWTObject.header.parsed).map(x=><p class='token-field'>{x + ': ' + JWTObject.header.parsed[x]}</p>)}</code>
                Payload
                <code>{Object.keys(JWTObject.payload.parsed).map(x=><p class='token-field'>{x + ': ' + JWTObject.payload.parsed[x]}</p>)}</code>
                <button class='cool-button' onClick={async ()=>{await commitJWTOnChain(JWTObject)}}>Verify Identity</button>
              </p>
      default:
        return <>
                  Authenticate via
                  <GoogleLogin
                      clientId="658977310896-knrl3gka66fldh83dao2rhgbblmd4un9.apps.googleusercontent.com"
                      buttonText="Login"
                      onSuccess={responseGoogle}
                      onFailure={responseGoogle}
                      cookiePolicy={'single_host_origin'}
                    />
                  or 
                  <FacebookLogin
                      appId="1088597931155576"
                      autoLoad={false}
                      fields="name,email,picture"
                      // onClick={componentClicked}
                      callback={responseFacebook} />
                  or 
                  <Form.Label>Paste JWT Here</Form.Label>
                  <Form.Control as="textarea" rows={4} value={JWTText} onChange={(event)=>{console.log(event.target.value); setJWTText(event.target.value)}}/>
                  <button class='cool-button' onClick={()=>setStep('userApproveJWT')}>Continue</button>
              </>

              
    }
    
  }

// These should be in their own file for modularity:
// returns idxStart, idxEnd
const searchSubtextInText = (subtext, text) => {
  let start = text.indexOf(subtext)
  return start, start + subtext.length
}


  return (  
    <div className="App">
      <header className="App-header">
              {account ? null : <button class='connect-wallet' onClick={async () => {
                await provider.send('eth_requestAccounts', []);
                setSigner(provider.getSigner());
              }}>Connect Wallet</button>
          }
        <Body step={step} />
      
    </header>
    </div>
  );
}

export default App;
