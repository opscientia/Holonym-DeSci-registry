import { GoogleLoginButton, ORCIDLoginButton, TwitterLoginButton, GitHubLoginButton } from './login-buttons.js'
import {
    useParams,
    useNavigate,
    Navigate
  } from 'react-router-dom';
import React, { useEffect, useRef, useState } from 'react'
import contractAddresses from '../contractAddresses.json'
import { fixedBufferXOR as xor, sandwichIDWithBreadFromContract, padBase64, hexToString, searchForPlainTextInBase64 } from 'wtfprotocol-helpers'
import abi from '../abi/VerifyJWT.json'
import { LitCeramic } from './lit-ceramic.js'
import { InfoButton } from './info-button.js';

import Github from '../img/Github.svg';
import Google from '../img/Google.svg';
import CircleWavy from '../img/CircleWavy.svg';
import CircleWavyCheck from '../img/CircleWavyCheck.svg';
import Orcid from '../img/Orcid.svg';
import TwitterLogo from '../img/TwitterLogo.svg';

const { ethers } = require('ethers')


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
        if(field == 'given_name'){field='Given First Name'}
        if(field == 'family_name'){field='Given Last Name'}
        // capitalize first letter:
        field = field.replace('_', ' ')
        field = field[0].toUpperCase() + field.substring(1)
  
        return <div>
                <h3>{field}</h3>
                <p class="identity-text">{props.section[x]}</p>
            </div>
      }
    })}
    </>
  }


const MessageScreen = (props) => {
    return <div className='bg-img x-section wf-section' style={{width:'100vw', height:'100vh'}}>
                <div className="x-container w-container">
                    <h3>{props.msg}</h3>
                </div>
            </div>
}
let pendingProofPopup = false; 

const AuthenticationFlow = (props) => {
    const params = useParams();
    const navigate = useNavigate();
    let token = params.token || props.token // Due to redirects with weird urls from some OpenID providers, there can't be a uniform way of accessing the token from the URL, so props based on window.location are used in weird situations
    console.log(props)
    const vjwt = props.web2service && props.provider ? new ethers.Contract(contractAddresses[props.web2service], abi, props.provider.getSigner()) : null;
    const [step, setStep] = useState(null);
    const [JWTText, setJWTText] = useState('');
    const [JWTObject, setJWTObject] = useState(''); //a fancy version of the JWT we will use for this script
    const [displayMessage, setDisplayMessage] = useState('');
    const [onChainCreds, setOnChainCreds] = useState(null);
    const [txHash, setTxHash] = useState(null);
    const [credentialsRPrivate, setCredentialsRPrivate] = useState(false);
    const [userHolo, setUserHolo] = useState({
        google: null,
        orcid: null,
        github: null,
        twitter: null,
    }); //should be useState(await wtf.getCredentialsForAddress(props.address))

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
      setDisplayMessage("It should take about 10 seconds until the transaction is finalized, depending on the chain you're using. Once it's final, you'll see a new popup to finish verification")
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
        return credentialsRPrivate ? <LitCeramic provider={props.provider} stringToEncrypt={JWTObject.header.raw + '.' + JWTObject.payload.raw}/> : <MessageScreen msg='Waiting for block to be mined' />
      case 'success':
        console.log(onChainCreds);
        console.log(`https://whoisthis.wtf/lookup/${props.web2service}/${onChainCreds}`)
        return onChainCreds ? 
    <div class="x-section bg-img wf-section" style={{width:'100vw', height:'100vh'}}>
        <div data-w-id="68ec56c7-5d2a-ce13-79d0-42d74e6f0829" class="x-container w-container">
            <div class="x-wrapper no-flex">
                <div class="spacer-large larger"></div>
                <h1 class="h1 small">Your identity is successfully verified</h1>
                <div class="spacer-small"></div>
                <div class="identity-wrapper">
                <div class="identity-div-1">
                    <div class="card-block">
                    <div class="card-heading">
                        <h3 class="h3 no-margin">{props.web2service.replace('orcid', 'ORC ID') /*hack to capitalize orcid lol this doesn't work for GOoole*/}</h3><img src={CircleWavyCheck} loading="lazy" alt="" class="verify-icon" />
                    </div>
                    <div class="spacer-xx-small"></div>
                    <p class="identity-text">{onChainCreds}</p>
                    </div>
                </div>
                </div>
                <div class="spacer-small"></div>
                <div class="identity-verified-btn-div">
                <a href="#" class="x-button secondary outline w-button">view transcation</a>
                <div class="spacer-x-small"></div>
                <a href={`https://whoisthis.wtf/lookup/${props.web2service}/${onChainCreds}`} class="x-button w-button">Go to my Holo</a>
                </div>
            </div>
        </div>  
    </div> : <p className='warning'>Failed to verify JWT on-chain</p>
  
      case 'userApproveJWT':
        if(!JWTObject){return 'waiting for token to load'}
        return displayMessage ? <MessageScreen msg={displayMessage} /> : 
        <div className='bg-img x-section wf-section' style={{width:'100vw', height:'100vh'}}>
            <div className="x-container w-container">
                <div className="x-wrapper small-center">
                    <div className="spacer-small"></div>
                        <div class="x-wrapper no-flex">
                            <div class="spacer-large larger"></div>
                            <h1 class="h1">Confirm Submission</h1>
                            <div class="spacer-medium"></div>
                            <DisplayJWTSection section={JWTObject.payload.parsed} />                
                        </div>
                            <div class="spacer-medium"></div>
                            <a href="#" class="x-button secondary w-button" onClick={async ()=>{await commitJWTOnChain(JWTObject)}}>submit public holo</a>
                            <div class="spacer-small"></div>
                            <div class="identity-info-div"></div>
                        </div>
                    </div>
                </div>
                    {/*Date.now() / 1000 > JWTObject.payload.parsed.exp ? 
                    <p className='success'>JWT is expired ✓ (that's a good thing)</p> 
                    : 
                    <p className='warning'>WARNING: Token is not expired. Submitting it on chain is dangerous</p>}*/}
                    {/*Header
                    <br />
                    <code>
                    <DisplayJWTSection section={JWTObject.header.parsed} />
                    </code>
                    
                    <DisplayJWTSection section={JWTObject.payload.parsed} />
                    {
                    
                    props.account ? <>
                    Then<br />
                    <button className='cool-button' onClick={async ()=>{await commitJWTOnChain(JWTObject)}}>Submit Public Holo</button>
                    <br />Otherwise<br />
                    <button className='cool-button' onClick={async ()=>{await commitJWTOnChain(JWTObject); setCredentialsRPrivate(true)}}>Submit Private Holo</button>
                    </>
                    : 
                    <button className='cool-button' onClick={props.connectWalletFunction}>Connect Wallet to Finish Verifying Yourself</button>
                    } */}
                
      default:
        return <div className='bg-img x-section wf-section' style={{width:'100vw', height:'100vh'}}>
    <div className="x-container w-container">
      <div className="x-wrapper small-center">
      <div className="spacer-small"></div>
        <h1 className="h1">Doxx your Holo</h1>
        <h2 className="p-1 white big">Define your Holonym by linking your accounts to the blockchain.</h2>
        <div className="spacer-medium"></div>
        <div className="x-card small">
          <div className="card-heading">
            <h3 id="w-node-_7e19a9c8-ff94-4387-04bd-6aaf6d53a8ea-b12b29e5" className="h3 no-margin">Link your profile</h3>
            <InfoButton text={ `This will link your blockchain address, ${props.account}, to your Web2 accounts! Please be careful and don't submit any credential you don't want to doxx this account with. This is where the Web Token Forwarding protocol comes in, using or issuing cryptographic signatures which prove the veracity of your credentials from Google, Twitter, Github, etc. You will be guided through a process to link the credentials on-chain 💥 🌈 🤩 ` } />
          </div>
          <div className="spacer-small"></div>
          <div className="card-text-wrapper">
            <div className="card-text-div"><img src={Google} loading="lazy" alt="" className="card-logo" />
              <div className="card-text">{userHolo.google || 'youremail@gmail.com'}</div>
              <GoogleLoginButton />
            </div><img src={userHolo.google ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
          </div>
          <div className="spacer-x-small"></div>
          <div className="card-text-wrapper">
            <div className="card-text-div"><img src={Orcid} loading="lazy" alt="" className="card-logo" />
              <div className="card-text">{userHolo.orcid || 'xxxx-xxxx-xxxx-xxxx'}</div>
              <ORCIDLoginButton />
            </div><img src={userHolo.orcid ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
          </div>
          <div className="spacer-x-small"></div>
          <div className="card-text-wrapper">
            <div className="card-text-div"><img src={TwitterLogo} loading="lazy" alt="" className="card-logo" />
              <div className="card-text">{`@${userHolo.twitter || 'twitterusername' }`}</div>
              <TwitterLoginButton />
            </div><img src={userHolo.twitter ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
          </div>
          <div className="spacer-x-small"></div>
          <div className="card-text-wrapper">
            <div className="card-text-div"><img src={Github} loading="lazy" alt="" className="card-logo" />
              <div className="card-text">{`@${userHolo.github || 'githubusername'}`}</div>
              <GitHubLoginButton />
            </div><img src={userHolo.github ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
          </div>
        </div>
        <div className="spacer-small"></div>
        {/* <a href="#" className="x-button secondary w-button">continue</a>
        <a href="#" className="x-button secondary no-outline w-button">Learn more</a> */}
      </div>
   </div>                   
</div>
  
              
    }
    
  }

  export default AuthenticationFlow;

  /*<h2>Login with a Web2 account to link it to your blockchain address</h2>
                  <div className='message'>{displayMessage}</div>
                  <GoogleLoginButton
                      onSuccess={r=>navigate(`/google/token/id_token=${r.tokenId}`)}
                    />
                  <ORCIDLoginButton />*/