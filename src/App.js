import logo from './logo.svg';
import './App.css';
import React, { useEffect, useRef, useState } from 'react';
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

function App() {
  apiRequest(2000);
  
  console.log(ethers.utils.sha256(ethers.utils.toUtf8Bytes('txt')));
  const orig = 'access_token=117a16aa-f766-4079-ba50-faaf0a09c864&token_type=bearer&expires_in=599&tokenVersion=1&persistent=true&id_token=eyJraWQiOiJwcm9kdWN0aW9uLW9yY2lkLW9yZy03aGRtZHN3YXJvc2czZ2p1am84YWd3dGF6Z2twMW9qcyIsImFsZyI6IlJTMjU2In0.eyJhdF9oYXNoIjoiX1RCT2VPZ2VZNzBPVnBHRWNDTi0zUSIsImF1ZCI6IkFQUC1NUExJMEZRUlVWRkVLTVlYIiwic3ViIjoiMDAwMC0wMDAyLTIzMDgtOTUxNyIsImF1dGhfdGltZSI6MTY0NDgzMDE5MSwiaXNzIjoiaHR0cHM6XC9cL29yY2lkLm9yZyIsImV4cCI6MTY0NDkxODUzNywiZ2l2ZW5fbmFtZSI6Ik5hbmFrIE5paGFsIiwiaWF0IjoxNjQ0ODMyMTM3LCJmYW1pbHlfbmFtZSI6IktoYWxzYSIsImp0aSI6IjcxM2RjMGZiLTMwZTAtNDM0Mi05ODFjLTNlYjJiMTRiODM0OCJ9.VXNSFbSJSdOiX7n-hWB6Vh30L1IkOLiNs2hBTuUDZ4oDB-cL6AJ8QjX7wj9Nj_lGcq1kjIfFLhowo8Jy_mzMGIFU8KTZvinSA-A-tJkXOUEvjUNjd0OfQJnVVJ63wvp9gSEj419HZ13Lc2ci9CRY7efQCYeelvQOQvpdrZsRLiQ_XndeDw2hDLAmI7YrYrLMy1zQY9rD4uAlBa56RVD7me6t47jEOOJJMAs3PC8UZ6pYyNc0zAjQ8Vapqz7gxeCN-iya91YI1AIE8Ut19hGgVRa9N7l-aUielPAlzss0Qbeyvl0KTRuZWnLUSrOz8y9oGxVBCUmStEOrVrAhmkMS8A&tokenId=254337461'
  // const pubkey = JSON.parse('{"keys":[{"kty":"RSA","e":"AQAB","use":"sig","kid":"production-orcid-org-7hdmdswarosg3gjujo8agwtazgkp1ojs","n":"jxTIntA7YvdfnYkLSN4wk__E2zf_wbb0SV_HLHFvh6a9ENVRD1_rHK0EijlBzikb-1rgDQihJETcgBLsMoZVQqGj8fDUUuxnVHsuGav_bf41PA7E_58HXKPrB2C0cON41f7K3o9TStKpVJOSXBrRWURmNQ64qnSSryn1nCxMzXpaw7VUo409ohybbvN6ngxVy4QR2NCC7Fr0QVdtapxD7zdlwx6lEwGemuqs_oG5oDtrRuRgeOHmRps2R6gG5oc-JqVMrVRv6F9h4ja3UgxCDBQjOVT1BFPWmMHnHCsVYLqbbXkZUfvP2sO1dJiYd_zrQhi-FtNth9qrLLv3gkgtwQ"}]}')
  // const [e, n] = [Buffer.from(pubkey.keys[0]['e'], 'base64url'), Buffer.from(pubkey.keys[0]['n'], 'base64url')]
  
  // const checkSignature = (message, e, n) => {

  // }
  let parsedToJSON = {}
  orig.split('&').map(x=>{let [key, value] = x.split('='); parsedToJSON[key] = value});
  let [headerRaw, payloadRaw, signatureRaw] = parsedToJSON['id_token'].split('.');
  let [header, payload] = [headerRaw, payloadRaw].map(x => JSON.parse(atob(x)));
  let [signature] = [Buffer.from(signatureRaw.replaceAll('-', '+').replaceAll('_', '/'), 'base64')] //replaceAlls convert it from base64url to base64
  // console.log(header, payload, signature)


  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(provider.getSigner());
  const [step, setStep] = useState(null);
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

  const commitJWTOnChain = async () => {
    let message = headerRaw + '.' + payloadRaw
    let publicHashedMessage = ethers.utils.keccak256(ethers.utils.toUtf8Bytes(message))
    let secretHashedMessage = ethers.utils.sha256(ethers.utils.toUtf8Bytes(message))
    console.log(account)
    let proof = await vjwt.XOR(secretHashedMessage, account)
    let txHash = await vjwt.commitJWTProof(proof, publicHashedMessage)
    console.log(txHash)
    provider.on(txHash, () => {setStep('waitingForBlockCompletion'); })
    // setStep('waitingForBlockCompletion')
  }

  const proveIKnewValidJWT = async (sig, message) => {
    await vjwt.verifyMe(ethers.BigNumber.from(sig), message)
  }

  // listen for the transaction to go to the mempool
  // provider.on('pending', async () => console.log('tx'))
  provider.on('block', async ()=>{
    if((step == 'waitingForBlockCompletion') && !pendingProofPopup){
      pendingProofPopup = true;
      await proveIKnewValidJWT(signature, headerRaw + '.' + payloadRaw)
    }
  })

  const Body = (props) => {
    switch(props.step){
      case 'waitingForBlockCompletion':
        return <p>Waiting for block to be mined</p>
      default:
        return <>
                  <p>
                          {Date.now() / 1000 > payload.exp ? <p class='success'>Expired ✓</p> : <p class='warning'>WARNING: Token is not expired. Submitting it on chain is dangerous</p>} Header
                          <br />
                          <code>{Object.keys(header).map(x=><p class='token-field'>{x + ': ' + header[x]}</p>)}</code>
                          Payload
                          <code>{Object.keys(payload).map(x=><p class='token-field'>{x + ': ' + payload[x]}</p>)}</code>
                          <button onClick={async ()=>{await commitJWTOnChain()}}>Verify Identity</button>
                  </p>
              </>
    }
    
  }
  return (  
    <div className="App">
      <header className="App-header">
              {account ? null : <button onClick={async () => {
                await provider.send('eth_requestAccounts', []);
                setSigner(provider.getSigner());
              }}>Connect Wallet</button>
          }
        <Body step={step} />
      
    </header>
    <body>
      <div id="fb-root"></div>
      <script async defer crossorigin="anonymous" src="https://connect.facebook.net/en_US/sdk.js#xfbml=1&version=v13.0" nonce="gHgcs0Ka"></script>
      <div class="fb-login-button" data-width="" data-size="small" data-button-type="login_with" data-layout="rounded" data-auto-logout-link="false" data-use-continue-as="false"></div>
      <script></script>
    </body>
    </div>
  );
}

export default App;
