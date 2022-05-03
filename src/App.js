import './App.css';
import './holo-wtf.webflow.css';
import './normalize.css';
import './webflow.css';
import AuthenticationFlow from './components/authentication-flow.js'
import Registry from './components/registry.js'
import { HomeLogo } from './components/logo.js';
import { Lookup } from './components/lookup.js';
import React, { useEffect, useRef, useState } from 'react';
// import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
// import FacebookLogin from 'react-facebook-login';
import Web3Modal from 'web3modal';
import WalletConnectProvider from '@walletconnect/web3-provider';
import WebFont from 'webfontloader';
import chainParams from './chainParams.json'
import Address from './components/address.js'
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';
import wtf from 'wtf-lib'
import { 
  Provider, 
  createClient, 
  chain, 
  useNetwork, 
  useConnect, 
  useAccount 
} from 'wagmi'
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet'
import { InjectedConnector } from 'wagmi/connectors/injected'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
const { ethers } = require('ethers');

const desiredChain = 'gnosis'
const desiredChainId = 100
const desiredChainRpcUrl = 'https://xdai-rpc.gateway.pokt.network'


try{
  window.ethereum.request({
    method: "wallet_addEthereumChain",
    params: [chainParams[desiredChain]]
  })
} catch(e) {
  console.log('error was', e)
}


function App() {
  const network = useNetwork({
    chainId: desiredChainId,
  })
  const { data: account } = useAccount()
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect()
  
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic']
      }
    });
   }, []);

  return (
    <div className='App x-section wf-section'>
      <div className='x-container nav w-container'>
        <HomeLogo />
        {account?.address ? <Address address={account.address} /> 
          : <button class='connect-wallet x-button secondary outline-menu w-button' disabled={!connectors[0].ready}
              key={connectors[0].id}
              onClick={() => connect(connectors[0])}
            >
              Connect Wallet
            </button>
        }
      </div>
      <Router>
        <Routes>
          <Route path='/orcid/token/*' element={<AuthenticationFlow
                                              account={account?.address}
                                              token={window.location.href.split('/token/#')[1]/*It is safe to assume that the 1st item of the split is the token -- if not, nothing bad happens; the token will be rejected. 
                                                                                                You may also be asking why we can't just get the token from the URL params. React router doesn't allow # in the URL params, so we have to do it manually*/}
                                              credentialClaim={'sub'} 
                                              web2service={'ORCID'}
                                              desiredChain={desiredChain} />} /> 
          {/*Google has a different syntax and redirect pattern than ORCID*/}
          <Route path='/google/token/:token' element={<AuthenticationFlow
                                              account={account?.address}
                                              credentialClaim={'email'}
                                              web2service={'Google'}
                                              desiredChain={desiredChain} />} /> 

          <Route path='/twitter/token/:token' element={<AuthenticationFlow
                                              account={account?.address}
                                              credentialClaim={'creds'}
                                              web2service={'Twitter'}
                                              desiredChain={desiredChain} />} /> 
          <Route path='/GitHub/token/:token' element={<AuthenticationFlow
                                              account={account?.address}
                                              credentialClaim={'creds'}
                                              web2service={'Github'}
                                              desiredChain={desiredChain} />} /> 

          <Route path='/lookup/:web2service/:credentials' element={<Lookup  desiredChain={desiredChain} />} />
          <Route path='/lookup' element={<Lookup  />} />
          <Route path='/' element={<Registry  address={account?.address} desiredChain={desiredChain} />} />
          <Route path='/myholo' element={<AuthenticationFlow
                                      account={account?.address}
                                      desiredChain={desiredChain} />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
