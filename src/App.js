import logo from './logo.png';
import './App.css';
import { LitCeramic } from './LitCeramic';
import { Lookup } from './Lookup.js';
import React, { useEffect, useRef, useState } from 'react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import GoogleLogin from 'react-google-login';
// import FacebookLogin from 'react-facebook-login';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';

import {
  BrowserRouter as Router,
  Routes,
  Route,
  useParams,
  useNavigate,
  Navigate
} from 'react-router-dom';

import contractAddresses from './contractAddresses.json';
import orcidImage from './img/orcid32.png';
import googleImage from './img/google32.png';

import { fixedBufferXOR as xor, sandwichIDWithBreadFromContract, padBase64, hexToString, searchForPlainTextInBase64 } from 'wtfprotocol-helpers';
import abi from './abi/VerifyJWT.json'
import chainParams from './chainParams.json'
import { WebSocketProvider } from '@ethersproject/providers';
const { ethers } = require('ethers');

let walletIsConnecting = false
// const provider = new ethers.providers.Web3Provider(window.ethereum);
// const initMetamaskOnNetwork = async (desiredChainID) => {
//   let onCorrectNetwork = false; let provider = null; let signer = null;
//   let provider = window.ethereum;
//   if(window.ethereum) {
//     let signer = provider.getSigner();
//     let currId = await provider.request({method: 'eth_chainId'});
//     if (currId == desiredChainID){
//       return [provider, signer, {'onDesiredChain' : true}]
//     } else {
//       try {
//         await provider.request({
//           method: 'wallet_switchEthereumChain',
//           params: [{ chainId: desiredChainID }],
//         });
//       } catch (err) {
//         // If chain wasn't added in metamask 
//         if (switchError.code === 4902) {
//           add
//         }
//         return [provider, signer, err]
//       }
//     }
//     return 
//   } else {
//     metamaskConnected = false
//   }
// }





// // const addAvaxToMetamask = () => {
// //   // https://docs.avax.network/build/tutorials/smart-contracts/add-avalanche-to-metamask-programmatically
// //   const AVALANCHE_MAINNET_PARAMS = {
// //     chainId: '0xA86A',
// //     chainName: 'Avalanche Mainnet C-Chain',
// //     nativeCurrency: {
// //         name: 'Avalanche',
// //         symbol: 'AVAX',
// //         decimals: 18
// //     },
// //     rpcUrls: ['https://api.avax.network/ext/bc/C/rpc'],
// //     blockExplorerUrls: ['https://snowtrace.io/']
// // }

// // const AVALANCHE_TESTNET_PARAMS = {
// //   chainId: '0xA869',
// //   chainName: 'Avalanche Testnet C-Chain',
// //   nativeCurrency: {
// //       name: 'Avalanche',
// //       symbol: 'AVAX',
// //       decimals: 18
// //   },
// //   rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
// //   blockExplorerUrls: ['https://testnet.snowtrace.io/']
// // }

// // function addAvalancheNetwork() {
// //   injected.getProvider().then(provider => {
// //     provider
// //       .request({
// //         method: 'wallet_addEthereumChain',
// //         params: [AVALANCHE_TESTNET_PARAMS]
// //       })
// //       .catch((error: any) => {
// //         console.log(error)
// //       })
// //   })
// // }
// // addAvalancheNetwork()
// // }

// // addAvaxToMetamask()




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

const ignoredFields = ['azp', 'kid', 'alg', 'at_hash', 'aud', 'auth_time', 'iss', 'exp', 'iat', 'jti', 'nonce'] //these fields should still be checked but just not presented to the users as they are unecessary for the user's data privacy and confusing for the user
// React component to display (part of) a JWT in the form of a javscript Object to the user
const DisplayJWTSection = (props) => {
  return <>
  {Object.keys(props.section).map(x => {
    console.log(x)
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


// these should be in their own file for butons
const ORCIDLogin = (props)=>{
  return <a style={{
    height: '64px',
    width: '256px',
    textDecoration : 'none', 
    backgroundColor: 'rgb(167,206,51)',
    color: 'white',
    borderRadius: '10px',
    fontSize: '21px',
    margin: '10px'
    // border: '3px solid red'
    }} 
    href='https://orcid.org/signin?response_type=token&redirect_uri=https:%2F%2Fwhoisthis.wtf/orcid/token/&client_id=APP-MPLI0FQRUVFEKMYX&scope=openid&nonce=whatever'>
      <img src={orcidImage} style={{marginTop: '10px', border: '3px solid white', borderRadius: '30px'}}></img>
      <span style={{position: 'relative', top: '10%'}}> Login with ORCID</span>
    </a>
}
const GoogleLoginButton = (renderProps)=>
<a style={{
  height: '64px',
  width: '256px',
  textDecoration : 'none', 
  backgroundColor: 'white',
  color: 'grey',
  borderRadius: '10px',
  fontSize: '21px',
  margin: '10px'
  // border: '3px solid red'
  }} 
  onClick={renderProps.onClick} disabled={renderProps.disabled}>
    <img src={googleImage} style={{marginTop: '10px', border: '3px solid white', borderRadius: '30px'}}></img>
    <span style={{position: 'relative', top: '10%'}}> Login with Google</span>
  </a>

const responseGoogle = (response) => {
  
  console.log(response);
}
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
  const navigate = useNavigate();
  let token = params.token || props.token // Due to redirects with weird urls from some OpenID providers, there can't be a uniform way of accessing the token from the URL, so props based on window.location are used in weird situations
  const vjwt = props.web2service ? new ethers.Contract(contractAddresses[props.web2service], abi, props.provider.getSigner()) : null;
  const [step, setStep] = useState(null);
  const [JWTText, setJWTText] = useState('');
  const [JWTObject, setJWTObject] = useState(''); //a fancy version of the JWT we will use for this script
  const [displayMessage, setDisplayMessage] = useState('');
  const [onChainCreds, setOnChainCreds] = useState(null);
  const [txHash, setTxHash] = useState(null);
  const [credentialsRPrivate, setCredentialsRPrivate] = useState(false);
  let revealBlock = 0; //block when user should be prompted to reveal their JWT
  // useEffect(()=>{if(token){setJWTText(token); setStep('userApproveJWT')}}, []) //if a token is provided via props, set the JWTText as the token and advance the form past step 1
  
  // if a token is already provided, set the step to user approving the token
  if(token){
    if(JWTText == ''){
      console.log('setting token')
      setJWTText(token); setStep('userApproveJWT')
    }
  } else {
    if(step){
      setStep(null)
    }
  }
  console.log(props, JWTText, step)

  useEffect(()=>setJWTObject(parseJWT(JWTText)), [JWTText]);


  if(!props.provider){console.log(props); return 'Please connect your wallet'}


  const commitJWTOnChain = async (JWTObject) => {
    console.log('commitJWTOnChat called')
    let message = JWTObject.header.raw + '.' + JWTObject.payload.raw
    // let publicHashedMessage = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message))
    let secretHashedMessage = ethers.utils.sha256(ethers.utils.toUtf8Bytes(message))
    setDisplayMessage('It may take some time for a block to be mined. You will be prompted a second time in about 10 seconds, once the transaction is confirmed. Depending on your chain\'s finality and confirmation times, you may want to wait even longer.')
    console.log(secretHashedMessage, props.account)
    // xor the values as bytes (without preceding 0x)
    let proofPt1 = xor(Buffer.from(secretHashedMessage.replace('0x',''), 'hex'), Buffer.from(props.account.replace('0x',''), 'hex'));
    let proof = ethers.utils.sha256(proofPt1)
    console.log(proof.toString('hex'))
    let tx = await vjwt.commitJWTProof(proof)
    revealBlock = await props.provider.getBlockNumber() + 1
    console.log('t', await props.provider.getBlockNumber() + 1, revealBlock)
    let revealed = false 
    props.provider.on('block', async () => {
      console.log(revealed, 'revealed')
      console.log(await props.provider.getBlockNumber(), revealBlock)
      if(( await props.provider.getBlockNumber() >= revealBlock) && (!revealed)){
        setStep('waitingForBlockCompletion')
        revealed=true
      }
    })
    // setStep('waitingForBlockCompletion')
  }

  // credentialField is 'email' for gmail and 'sub' for orcid. It's the claim of the JWT which should be used as an index to look the user up by
  const proveIKnewValidJWT = async (credentialClaim) => {
    let sig = JWTObject.signature.decoded
    let message = JWTObject.header.raw + '.' + JWTObject.payload.raw
    let payloadIdx = Buffer.from(JWTObject.header.raw).length + 1
    console.log(JWTObject.payload.parsed[credentialClaim])
    let sandwich = await sandwichIDWithBreadFromContract(JWTObject.payload.parsed[credentialClaim], vjwt);
    console.log(sandwich, JWTObject.payload.raw)
    let [startIdx, endIdx] = searchForPlainTextInBase64(Buffer.from(sandwich, 'hex').toString(), JWTObject.payload.raw)

    console.log(vjwt, ethers.BigNumber.from(sig), message, payloadIdx, startIdx, endIdx, sandwich)
    console.log(vjwt.address)
    let tx = await vjwt.verifyMe(ethers.BigNumber.from(sig), message, payloadIdx, startIdx, endIdx, '0x'+sandwich);
    
    setTxHash(tx.hash)
    return tx

  }

  // vjwt is VerifyJWT smart contract as an ethers object, JWTObject is the parsed JWT
  const submitAnonymousCredentials = async (vjwt, JWTObject) => {
    let message = JWTObject.header.raw + '.' + JWTObject.payload.raw
    let sig = JWTObject.signature.decoded
    let tx = await vjwt.linkPrivateJWT(ethers.BigNumber.from(sig), ethers.utils.sha256(ethers.utils.toUtf8Bytes(message)))
    setTxHash(tx.hash)
    return tx
  }

  // listen for the transaction to go to the mempool
  // props.provider.on('pending', async () => console.log('tx'))


  switch(step){
    case 'waitingForBlockCompletion':
      if(!pendingProofPopup){
        pendingProofPopup = true;
        // this should be multiple functions eventually instead of convoluded nested loops
        if(credentialsRPrivate){
          submitAnonymousCredentials(vjwt, JWTObject).then(tx => {
            props.provider.once(tx, async () => {    
              console.log('WE SHOULD NOTIFY THE USER WHEN THIS FAILS')        
              // setStep('success'); 
            })
          })
        } else {
          proveIKnewValidJWT(props.credentialClaim).then(tx => {
            props.provider.once(tx, async () => {
              console.log(props.account)
              console.log(await vjwt.credsForAddress(props.account))
              console.log(hexToString(await vjwt.credsForAddress(props.account)))
              await setOnChainCreds(
                hexToString(await vjwt.credsForAddress(props.account))
              );
        
              setStep('success'); })
          })
        }
      }
      return credentialsRPrivate ? <LitCeramic provider={props.provider} stringToEncrypt={JWTObject.header.raw + '.' + JWTObject.payload.raw}/> : <p>Waiting for block to be mined</p>
    case 'success':
      console.log(onChainCreds);
      console.log(`https://whoisthis.wtf/lookup/${props.web2service}/${onChainCreds}`)
      return onChainCreds ? 
      <>
        <p class='success'>✓ You're successfully verified as {onChainCreds} :)</p>
        <br />
        <a href={'https://testnet.snowtrace.io/tx/' + txHash}>transaction hash</a>
        <a href={`https://whoisthis.wtf/lookup/${props.web2service}/${onChainCreds}`}>look me up</a>
      </> : <p class='warning'>Failed to verify JWT on-chain</p>

    case 'userApproveJWT':
      if(!JWTObject){return 'waiting for token to load'}
      return displayMessage ? displayMessage : <p>
              <h1>If you're OK with this info being on-chain</h1>
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
                
                props.account ? <>
                Then<br />
                <button class='cool-button' onClick={async ()=>{await commitJWTOnChain(JWTObject)}}>Submit Public Holo</button>
                <br />Otherwise<br />
                <button class='cool-button' onClick={async ()=>{await commitJWTOnChain(JWTObject); setCredentialsRPrivate(true)}}>Submit Private Holo</button>
                </>
                 : 
                <button class='cool-button' onClick={props.connectWalletFunction}>Connect Wallet to Finish Verifying Yourself</button>}
            </p>
    default:
      return <>
                <h2>Login with a Web2 account to link it to your blockchain address</h2>
                <div class='message'>{displayMessage}</div>
                <GoogleLogin
                    clientId='254984500566-3qis54mofeg5edogaujrp8rb7pbp9qtn.apps.googleusercontent.com'
                    render={renderProps => <GoogleLoginButton {...renderProps} />}
                    onSuccess={r=>navigate(`/google/token/id_token=${r.tokenId}`)}
                    onFailure={responseGoogle}
                  />
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
  const desiredChain = 'mumbai'
  // apiRequest(2000);
  
  // const orig = 'access_token=117a16aa-f766-4079-ba50-faaf0a09c864&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJwcm9kdWN0aW9uLW9yY2lkLW9yZy03aGRtZHN3YXJvc2czZ2p1am84YWd3dGF6Z2twMW9qcyIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiX1RCT2VPZ2VZNzBPVnBHRWNDTi0zUSIsImF1ZCI6IkFQUC1NUExJMEZRUlVWRkVLTVlYIiwic3ViIjoiMDAwMC0wMDAyLTIzMDgtOTUxNyIsImF1dGhfdGltZSI6MTY0NDgzMDE5MSwiaXNzIjoiaHR0cHM6XC9cL29yY2lkLm9yZyIsImV4cCI6MTY0NDkxODUzNywiZ2l2ZW5fbmFtZSI6Ik5hbmFrIE5paGFsIiwiaWF0IjoxNjQ0ODMyMTM3LCJmYW1pbHlfbmFtZSI6IktoYWxzYSIsImp0aSI6IjcxM2RjMGZiLTMwZTAtNDM0Mi05ODFjLTNlYjJiMTRiODM0OCJ9.VXNSFbSJSdOiX7n-hWB6Vh30L1IkOLiNs2hBTuUDZ4oDB-cL6AJ8QjX7wj9Nj_lGcq1kjIfFLhowo8Jy_mzMGIFU8KTZvinSA-A-tJkXOUEvjUNjd0OfQJnVVJ63wvp9gSEj419HZ13Lc2ci9CRY7efQCYeelvQOQvpdrZsRLiQ_XndeDw2hDLAmI7YrYrLMy1zQY9rD4uAlBa56RVD7me6t47jEOOJJMAs3PC8UZ6pYyNc0zAjQ8Vapqz7gxeCN-iya91YI1AIE8Ut19hGgVRa9N7l-aUielPAlzss0Qbeyvl0KTRuZWnLUSrOz8y9oGxVBCUmStEOrVrAhmkMS8A&tokenId=254337461'

  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(provider ? provider.getSigner() : provider);
  const [onRightChain, setOnRightChain] = useState(false);
  
  // Get metamask on the right network
  const switchToChain = (chainName, provider_) => {
    provider_.request({
            method: "wallet_addEthereumChain",
            params: [chainParams[chainName]]
          }
        )
  }
  // switchToChain(desiredChain, provider)
    
  const networkChanged = (network) => {
    console.log('network changed')
    if(Number(network) == Number(chainParams[desiredChain].chainId)){ //number converts between hex and int
      setOnRightChain(true)
    } else {
      setOnRightChain(false)
      try{switchToChain(desiredChain)}catch{}
    }
  }

  const signerChanged = async () => {
    console.log('SIGNER WAS CHANGED', provider, signer)
    let address;
    try {
      address = await signer.getAddress();
      setAccount(address);
    }
    catch (err) {
      console.log('need to login to metamask')
    }
    // also set the network correctly:
    try {
      let currentChainId = await provider.request({method: 'eth_chainId'})
      console.log('CURRENT CHAIN ID IS ', currentChainId)
      networkChanged(currentChainId)
    } catch (err) {
      console.log(provider, err)
    }
    
    
  }

  useEffect(signerChanged, [signer]);
  useEffect(signerChanged, []); //also update initially when the page loads

  if(!provider){

    // set walletConnect options
    let wcOptions = {rpc:{}}
    wcOptions.rpc[chainParams[desiredChain].chainId] = chainParams[desiredChain].rpcUrls[0]

    const providerOptions = {
      walletconnect: {
        package: WalletConnectProvider,
        options: wcOptions,
        chainId: 1
      }
    };

    const web3Modal = new Web3Modal({
      network: "mainnet", // optional
      cacheProvider: true, // optional
      providerOptions // required
    });
    // only run once, using connecting global variable to track whether it's been run -- this is to prevent annoying metamask error when connection to wallet is prompted twice
    if(!walletIsConnecting){
      walletIsConnecting = true;
      web3Modal.connect().then(instance => {
        let provider = new ethers.providers.Web3Provider(instance)
        setProvider(provider)
        setSigner(provider.getSigner())
        console.log('new provider is', provider)
        console.log('connected??')
        });
    }
    }
  if(!provider){
    return 'pls connect ur wallet'
  }
  console.log('Provider is', provider)
  provider.on('accountsChanged', function (accounts) {
   setAccount(accounts[0])

  });

  // make sure the current chain is always the desired network
  provider.on('networkChanged', function (network) {
    networkChanged(network)
  });

  // if (!onRightChain){
  //   return 'Please make sure metamask is installed and switched to Polygon Mumbai Testnet'
  // }

  const connectWallet = async () => {
    await provider.send('eth_requestAccounts', []);
    setSigner(provider.getSigner());
  }

  const LoginButton = () => {
    const { loginWithRedirect } = useAuth0();

    return <button onClick={() => loginWithRedirect()}>Log In</button>;
  };
  return (
    <Auth0Provider 
      domain='localhost:3000'
      clientId='vDweibbnTY1aIV78RBJXGseIiD95sSFj'
      redirectUri={window.location.origin}>
    <div className="App">
      <header className="App-header">
              {account ? null : <button class='connect-wallet' onClick={connectWallet}>Connect Wallet</button>
          }
        <Router>
          <Routes>
            <Route path='/orcid/token/*' element={<AuthenticationFlow 
                                                provider={provider}
                                                account={account} 
                                                connectWalletFunction={connectWallet}
                                                token={window.location.href.split('/token/#')[1]/*It is safe to assume that the 1st item of the split is the token -- if not, nothing bad happens; the token will be rejected. 
                                                                                                   You may also be asking why we can't just get the token from the URL params. React router doesn't allow # in the URL params, so we have to do it manually*/}
                                                credentialClaim={'sub'} 
                                                web2service={'orcid'} />} /> 
            {/*Google has a different syntax and redirect pattern than ORCID*/}
            <Route path='/google/token/:token' element={<AuthenticationFlow
                                                provider={provider} 
                                                account={account} 
                                                connectWalletFunction={connectWallet}
                                                credentialClaim={'email'}
                                                web2service={'google'} />} /> 

            <Route path='/lookup/:web2service/:credentials' element={<Lookup provider={provider} />} />
            <Route path='/lookup' element={<Lookup provider={provider} />} />
            {/* <Route path='/private' element={<LitCeramic stringToEncrypt={JWTObject.header.raw + '.' + JWTObject.payload.raw}/>} /> */}
            <Route path='/' element={<AuthenticationFlow 
                                        provider={provider}
                                        account={account} 
                                        connectWalletFunction={connectWallet} />} />
          </Routes>
        </Router>
      
    </header>
    <LoginButton />
    </div>
    </Auth0Provider>
  );
}

export default App;
