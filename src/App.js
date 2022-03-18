import logo from './logo.png';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';
import GoogleLogin from 'react-google-login';
import FacebookLogin from 'react-facebook-login';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams
} from 'react-router-dom';
import orcidImage from './img/orcid32.png';

import { fixedBufferXOR as xor, sandwichIDWithBreadFromContract, padBase64, hexToString, searchForPlainTextInBase64 } from 'wtfprotocol-helpers';
const { ethers } = require('ethers');

const provider = new ethers.providers.Web3Provider(window.ethereum);
const signer = provider.getSigner();
const abi = [
  "constructor(uint256,bytes,bytes,bytes)",
  "event JWTVerification(bool)",
  "event KeyAuthorization(bool)",
  "event modExpEventForTesting(bytes)",
  "function JWTForAddress(address) view returns (string)",
  "function XOR(uint256,uint256) pure returns (uint256)",
  "function addressForCreds(bytes) view returns (address)",
  "function addressForJWT(string) view returns (address)",
  "function addressToBytes(address) pure returns (bytes)",
  "function bottomBread() view returns (bytes)",
  "function bytes32ToBytes(bytes32) pure returns (bytes)",
  "function bytes32ToUInt256(bytes32) pure returns (uint256)",
  "function bytesAreEqual(bytes,bytes) pure returns (bool)",
  "function bytesToFirst32BytesAsBytes32Type(bytes) pure returns (bytes32)",
  "function bytesToLast32BytesAsBytes32Type(bytes) pure returns (bytes32)",
  "function checkJWTProof(address,string) view returns (bool)",
  "function checkJWTProof(address,bytes32) view returns (bool)",
  "function commitJWTProof(bytes32)",
  "function credsForAddress(address) view returns (bytes)",
  "function destructivelySliceBytesMemory(bytes,uint256,uint256) pure returns (bytes)",
  "function e() view returns (uint256)",
  "function getRegisteredAddresses() view returns (address[])",
  "function getRegisteredCreds() view returns (bytes[])",
  "function hasAccess(address,address) view returns (bool)",
  "function hashFromSignature(uint256,bytes,bytes) returns (bytes32)",
  "function linkPrivateJWT(bytes,bytes32)",
  "function modExp(bytes,uint256,bytes) returns (bytes)",
  "function n() view returns (bytes)",
  "function privateJWTAllowances(address,address) view returns (bool)",
  "function privateJWTForAddress(address) view returns (bytes32)",
  "function proofToBlock(bytes32) view returns (uint256)",
  "function registeredAddresses(uint256) view returns (address)",
  "function registeredCreds(uint256) view returns (bytes)",
  "function setAccess(address,bool)",
  "function sliceBytesMemory(bytes,uint256,uint256) view returns (bytes)",
  "function stringToBytes(string) pure returns (bytes)",
  "function testAddressByteConversion(address) pure returns (bool)",
  "function testSHA256OnJWT(string) pure returns (bytes32)",
  "function topBread() view returns (bytes)",
  "function verifiedUsers(uint256) view returns (bytes32)",
  "function verifyJWT(bytes,string) returns (bool)",
  "function verifyMe(bytes,string,uint256,uint256,uint256,bytes)"
]


// const addAvaxToMetamask = () => {
//   // https://docs.avax.network/build/tutorials/smart-contracts/add-avalanche-to-metamask-programmatically
//   const AVALANCHE_MAINNET_PARAMS = {
//     chainId: '0xA86A',
//     chainName: 'Avalanche Mainnet C-Chain',
//     nativeCurrency: {
//         name: 'Avalanche',
//         symbol: 'AVAX',
//         decimals: 18
//     },
//     rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
//     blockExplorerUrls: ['https://snowtrace.io/']
// }

// const AVALANCHE_TESTNET_PARAMS = {
//   chainId: '0xA869',
//   chainName: 'Avalanche Testnet C-Chain',
//   nativeCurrency: {
//       name: 'Avalanche',
//       symbol: 'AVAX',
//       decimals: 18
//   },
//   rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
//   blockExplorerUrls: ['https://testnet.snowtrace.io/']
// }

// function addAvalancheNetwork() {
//   injected.getProvider().then(provider => {
//     provider
//       .request({
//         method: 'wallet_addEthereumChain',
//         params: [AVALANCHE_TESTNET_PARAMS]
//       })
//       .catch((error: any) => {
//         console.log(error)
//       })
//   })
// }
// addAvalancheNetwork()
// }

// addAvaxToMetamask()

let providerAddresses = {
  'orcid' : '0x4D39C84712C9A13f4d348050E82A2Eeb45DB5e29', // avax
  // 'orcid' : '0x02D725e30B89A9229fe3Cd16005226f7A680601B', // polygon
  // 'orcid' : '0xdF10310d2C72F5358b19bF6A7C817Ec4570b270f', //harmony
  // 'orcid' : '0x87b6e03b0D57771940D7cC9E92531B6217364B3E', //fantom
  'google' : null,
  'facebook' : null,
  'github' : null,
}


// var jwt = require('jsonwebtoken');
let pendingProofPopup = false; 

// These should be in their own file for modularity:
// returns idxStart, idxEnd
const searchSubtextInText = (subtext, text) => {
  let start = text.indexOf(subtext)
  return start, start + subtext.length
}

// const apiRequest = (authCode)=>{
//   var url = "https://orcid.org/oauth/token";
  
//     var xhr = new XMLHttpRequest();
//     xhr.open("POST", url);

//     xhr.setRequestHeader("Accept", "application/json");
//     xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

//     xhr.onreadystatechange = function () {
//         console.log('something happened')
//       if (xhr.readyState === 4) {
//           console.log(xhr.status);
//           console.log(xhr.responseText);
//       }};

//     var data = "client_id=APP-MPLI0FQRUVFEKMYX&client_secret=0c2470a1-ab05-457a-930c-487188e658e2&grant_type=authorization_code&redirect_uri=https://developers.google.com/oauthplayground&code=" + authCode;
//     xhr.send(data);
// }


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

const ignoredFields = ['kid', 'alg', 'at_hash', 'aud', 'auth_time', 'iss', 'exp', 'iat', 'jti', 'nonce'] //these fields should still be checked but just not presented to the users as they are unecessary for the user's data privacy and confusing for the user
// React component to display (part of) a JWT in the form of a javscript Object to the user
const DisplayJWTSection = (props) => {
  return <>
  {Object.keys(props.section).map(x => {
    if(ignoredFields.includes(x)){
      return null
    } else {
      let field = x;
      // give a human readable name to important field:
      if(field == 'sub'){field='subject (ID)'}
      // capitalize first letter:
      field = field.replace('_', ' ')
      field = field[0].toUpperCase() + field.substring(1)

      return <p class='token-field'>{field + ': ' + props.section[x]}</p>
    }
  })}
  </>
}

const ORCIDLogin = (props)=>{
  return <a style={{
    height: '64px',
    width: '256px',
    textDecoration : 'none', 
    backgroundColor: 'rgb(167,206,51)',
    color: 'white',
    borderRadius: '10px',
    fontSize: '21px'
    // border: '3px solid red'
    }} href='https://orcid.org/signin?response_type=token&redirect_uri=https:%2F%2Fwhoisthis.wtf/orcid/token/&client_id=APP-MPLI0FQRUVFEKMYX&scope=openid&nonce=whatever'>
    <img src={orcidImage} style={{marginTop: '10px', border: '3px solid white', borderRadius: '30px'}}></img>
    <span style={{position: 'relative', bottom: '10px'}}> Login with ORCID</span>
    </a>
}

// const responseGoogle = (response) => {
//   console.log(response);
// }
// const responseFacebook = (response) => {
//   let expirationDateString = (new Date(response.data_access_expiration_time * 1000)).toString()
//   console.log(response)
//   let message = 'IMPORTANT! Please do not submit this JWT yet as it is not expired. It is below so you can copy it. Please return after it expires at ' 
//   + expirationDateString 
//   + ' and paste it:\n\n\n\n'
//   + JSON.stringify(response)
//   console.log(message);
//   // setMessage(message)
//   setMessage('Support for Facebook is still pending...')

// }

const AuthenticationFlow = (props) => {

  const params = useParams();
  const vjwt = params.provider ? new ethers.Contract(providerAddresses[params.provider], abi, signer) : null;
  const [step, setStep] = useState(null);
  const [JWTText, setJWTText] = useState('');
  const [JWTObject, setJWTObject] = useState(''); //a fancy version of the JWT we will use for this script
  const [displayMessage, setDisplayMessage] = useState('');
  const [onChainCreds, setOnChainCreds] = useState(null);
  const [txHash, setTxHash] = useState(null);

  useEffect(()=>{if(props.token){setJWTText(props.token); setStep('userApproveJWT')}}, []) //if a token is provided via props, set the JWTText as the token and advance the form past step 1
  useEffect(()=>setJWTObject(parseJWT(JWTText)), [JWTText]);

  const commitJWTOnChain = async (JWTObject) => {
    let message = JWTObject.header.raw + '.' + JWTObject.payload.raw
    // let publicHashedMessage = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message))
    let secretHashedMessage = ethers.utils.sha256(ethers.utils.toUtf8Bytes(message))
    setDisplayMessage('It may take some time for a block to be mined. You will be prompted a second time in about 30 seconds, once the transaction is confirmed. Depending on your chain\'s finality and confirmation times, you may want to wait even longer.')
    console.log(secretHashedMessage, props.account)
    // xor the values as bytes (without preceding 0x)
    let proofPt1 = xor(Buffer.from(secretHashedMessage.replace('0x',''), 'hex'), Buffer.from(props.account.replace('0x',''), 'hex'));
    let proof = ethers.utils.sha256(proofPt1)
    console.log(proof.toString('hex'))
    let tx = await vjwt.commitJWTProof(proof)
    console.log(tx)
    provider.once(tx, () => {console.log('has beeen mined'); setStep('waitingForBlockCompletion'); })
    // setStep('waitingForBlockCompletion')
  }

  // sig: JWT signature, payloadIdx: byte where the payload starts within the message, startIdx: byte where the sandwich starts within the payload, endIdx: byte where the sandwich ends within the payload, sandwich: sandwich content
  const proveIKnewValidJWT = async (sig, message, payloadIdx, startIdx, endIdx, sandwich) => {
    console.log(vjwt, ethers.BigNumber.from(sig), message, payloadIdx, startIdx, endIdx, sandwich)
    let tx = await vjwt.verifyMe(ethers.BigNumber.from(sig), message, payloadIdx, startIdx, endIdx, sandwich);
    provider.on(tx, async () => {await setOnChainCreds(hexToString(await vjwt.credsForAddress(props.account))); setStep('success'); })
    setTxHash(tx.hash)

  }

  // listen for the transaction to go to the mempool
  // provider.on('pending', async () => console.log('tx'))
  provider.on('block', async ()=>{
    console.log('ON block')
    console.log(step, pendingProofPopup)
    if((step == 'waitingForBlockCompletion') && !pendingProofPopup){
      pendingProofPopup = true;
      console.log('this ran')
      let sig = JWTObject.signature.decoded;
      console.log('21')
      let message = JWTObject.header.raw + '.' + JWTObject.payload.raw;
      console.log('f8u')
      console.log(sig, message)
      let payloadIdx = Buffer.from(JWTObject.header.raw).length + 1;
      console.log(payloadIdx)
      console.log('ID ', JWTObject.payload.parsed.sub)
      let sandwich = await sandwichIDWithBreadFromContract(JWTObject.payload.parsed.sub, vjwt);
      let [startIdx, endIdx] = searchForPlainTextInBase64(Buffer.from(sandwich, 'hex').toString(), JWTObject.payload.raw)

      await proveIKnewValidJWT(sig, message, payloadIdx, startIdx, endIdx, '0x'+sandwich)
    }
  })

  switch(step){
    case 'success':
      console.log(onChainCreds);
      return onChainCreds ? 
      <>
        <p class='success'>✓ You're successfully verified as {onChainCreds} :)</p><br /><a href={txHash}>transaction hash</a>
      </> : <p class='warning'>Failed to verify JWT on-chain</p>
    case 'waitingForBlockCompletion':
      return <p>Waiting for block to be mined</p>
    case 'userApproveJWT':
      if(!JWTObject){return 'waiting for token to load'}
      return displayMessage ? displayMessage : <p>
              <h1>Confirm you're OK with this info being on-chain</h1>
              {/*Date.now() / 1000 > JWTObject.payload.parsed.exp ? 
                <p class='success'>JWT is expired ✓ (that's a good thing)</p> 
                : 
                <p class='warning'>WARNING: Token is not expired. Submitting it on chain is dangerous</p>}*/}
              {/*Header
              <br />
              <code>
                <DisplayJWTSection section={JWTObject.header.parsed} />
              </code>
              */}
              <code><DisplayJWTSection section={JWTObject.payload.parsed} /></code>
              {
                
                props.account ? 
                <button class='cool-button' onClick={async ()=>{await commitJWTOnChain(JWTObject)}}>Verify Identity</button>
                 : 
                <button class='cool-button' onClick={props.connectWalletFunction}>Connect Wallet to Finish Verifying Yourself</button>}
            </p>
    default:
      return <>
                <div class='message'>{displayMessage}</div>
                
                {/*
                <p>Authenticate via</p>
                <GoogleLogin
                    clientId="254984500566-3qis54mofeg5edogaujrp8rb7pbp9qtn.apps.googleusercontent.com"
                    buttonText="Login"
                    onSuccess={responseGoogle}
                    onFailure={responseGoogle}
                  />
                <p>or</p> 
                <FacebookLogin
                    appId="1420829754999380"
                    autoLoad={false}
                    fields="name,email,picture"
                    // onClick={componentClicked}
                callback={responseFacebook} />*/}
                <ORCIDLogin />
                
                {
                  /*<p>or</p> 
                  <p>Paste Your ORCID JWT</p>
                  <Form.Control as="textarea" rows={4} value={JWTText} onChange={(event)=>{console.log(event.target.value); setJWTText(event.target.value)}}/>*/
                }

                {/*<button class='cool-button' onClick={()=>setStep('userApproveJWT')}>Continue</button>*/}
            </>

            
  }
  
}
function App() {
  // apiRequest(2000);
  
  // const orig = 'access_token=117a16aa-f766-4079-ba50-faaf0a09c864&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJwcm9kdWN0aW9uLW9yY2lkLW9yZy03aGRtZHN3YXJvc2czZ2p1am84YWd3dGF6Z2twMW9qcyIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiX1RCT2VPZ2VZNzBPVnBHRWNDTi0zUSIsImF1ZCI6IkFQUC1NUExJMEZRUlVWRkVLTVlYIiwic3ViIjoiMDAwMC0wMDAyLTIzMDgtOTUxNyIsImF1dGhfdGltZSI6MTY0NDgzMDE5MSwiaXNzIjoiaHR0cHM6XC9cL29yY2lkLm9yZyIsImV4cCI6MTY0NDkxODUzNywiZ2l2ZW5fbmFtZSI6Ik5hbmFrIE5paGFsIiwiaWF0IjoxNjQ0ODMyMTM3LCJmYW1pbHlfbmFtZSI6IktoYWxzYSIsImp0aSI6IjcxM2RjMGZiLTMwZTAtNDM0Mi05ODFjLTNlYjJiMTRiODM0OCJ9.VXNSFbSJSdOiX7n-hWB6Vh30L1IkOLiNs2hBTuUDZ4oDB-cL6AJ8QjX7wj9Nj_lGcq1kjIfFLhowo8Jy_mzMGIFU8KTZvinSA-A-tJkXOUEvjUNjd0OfQJnVVJ63wvp9gSEj419HZ13Lc2ci9CRY7efQCYeelvQOQvpdrZsRLiQ_XndeDw2hDLAmI7YrYrLMy1zQY9rD4uAlBa56RVD7me6t47jEOOJJMAs3PC8UZ6pYyNc0zAjQ8Vapqz7gxeCN-iya91YI1AIE8Ut19hGgVRa9N7l-aUielPAlzss0Qbeyvl0KTRuZWnLUSrOz8y9oGxVBCUmStEOrVrAhmkMS8A&tokenId=254337461'


  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(provider.getSigner());
  
  const signerChanged = async () => {
    let address;
    try {
      address = await signer.getAddress();
      setAccount(address);
      console.log('SET ACCOUNT!!!')
    }
    catch (err) {
      console.log('need to login to metamask')
    }
    console.log('called signer change');
  }

  useEffect(signerChanged, [signer]);
  useEffect(signerChanged, []); //also update initially when the page loads

  const connectWallet = async () => {
    await provider.send('eth_requestAccounts', []);
    setSigner(provider.getSigner());
  }

  return (
    <div className="App">
      <header className="App-header">
              {account ? null : <button class='connect-wallet' onClick={connectWallet}>Connect Wallet</button>
          }
        <Router>
          <Routes>
            <Route path='/:provider/token/*' element={<AuthenticationFlow 
                                                account={account} 
                                                connectWalletFunction={connectWallet}
                                                token={window.location.href.split('/token/#')[1]/*It is safe to assume that the 1st item of the split is the token -- if not, nothing bad happens; the token will be rejected. 
                                                                                                    You may also be asking why we can't just get the token from the URL params. React router doesn't allow # in the URL params, so we have to do it manually*/}
                                                web2service={window.location.href.split('/token/#')[0].split('.com/'[1])} />} /> 
            <Route path='/' element={<AuthenticationFlow 
                                        account={account} 
                                        connectWalletFunction={connectWallet} />} />
          </Routes>
        </Router>
      
    </header>
    </div>
  );
}

export default App;
