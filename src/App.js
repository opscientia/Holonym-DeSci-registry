import "./App.css";
import "./holo-wtf.webflow.css";
import "./normalize.css";
import "./webflow.css";
import AuthenticationFlow from "./components/authentication-flow.js";
import Registry from "./components/registry.js";
import { HomeLogo } from "./components/logo.js";
import { Lookup } from "./components/lookup.js";
import React, { useEffect, useState } from "react";
import WebFont from "webfontloader";
import Address from "./components/atoms/Address.js";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useConnect, useAccount, useNetwork } from "wagmi";
import { desiredChain } from "./constants/desiredChain";
import chainParams from "./constants/chainParams.json"

import { Modal } from "./components/atoms/Modal.js";
import Error from "./components/errors.js";

const addChain = (chainName, provider) => {
  // make sure provider exists and has request method
  // NOTE : may need to put "|| provider.provider.request" in this if statement 
  if(!provider || !provider.request){return}
  provider.request({
          method: "wallet_addEthereumChain",
          params: [chainParams[chainName]]
        }
  )
}

function App() {
  const { data: account } = useAccount();
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  const {
    activeChain,
    chains,
    isLoading,
    pendingChainId,
    switchNetwork,
  } = useNetwork();
  const [walletModal, setWalletModal] = useState(false)
  
  useEffect(() => {
    WebFont.load({
      google: {
        families: [
          "Montserrat:100,100italic,200,200italic,300,300italic,400,400italic,500,500italic,600,600italic,700,700italic,800,800italic,900,900italic",
        ],
      },
    });
  }, []);


  let myHoloPage = <AuthenticationFlow desiredChain={desiredChain} />;

  /*Make sure it's on the correct chain:*/
  if(!isLoading && activeChain?.id === parseInt(chainParams[desiredChain].chainId)){
    console.log('correct chain')
  } else {
    if(!window.ethereum)
      myHoloPage = <Error msg={`could not switch to ${desiredChain} chain. Please manually switch to ${desiredChain}`} />
    addChain(desiredChain, window.ethereum)
    // try {
    //   switchNetwork?.(desiredChain.chainId)
    // } catch(err) {
    //   console.log(err)
    // }
    
  }
  // if(! (activeChain?.id === parseInt(chainParams[desiredChain].chainId))){
  //   myHoloPage = <h1>Switching to {desiredChain}...</h1>
  // }

  return (
    
    <div className="App x-section wf-section">
      <div className="x-container nav w-container">
        <Modal visible={walletModal} setVisible={setWalletModal} blur={true}>
              <div className="x-wrapper small-center" style={{ padding: "0px", minWidth: "285px" }}>
                <h2>Select Wallet</h2>
                {connectors.map((connector) => (
                <button
                  className="x-button secondary"
                  disabled={!connector.ready}
                  key={connector.id}
                  onClick={() => connect(connector)}
                >
                  {connector.name}
                  {!connector.ready && ' (unsupported)'}
                  {isConnecting &&
                    connector.id === pendingConnector?.id &&
                    ' (connecting)'}
                </button>
              ))}

              {error && <p>{error.message}</p>}
              </div>
            </Modal>
        <HomeLogo />
        {/* {chains.map((x) => (
        <button
          disabled={!switchNetwork || x.id === activeChain?.id}
          key={x.id}
          onClick={() => switchNetwork?.(280)}
        >
          {x.name}
          {isLoading && pendingChainId === x.id && ' (switching)'}
        </button>
      ))} */}
        {account?.address ? (
          <Address address={account.address} />
        ) : (
          <div className="nav-btn">
            <div
              className="wallet-connected nav-button"
              // disabled={!connectors[0].ready}
              // key={connectors[0].id}
              onClick={()=>setWalletModal(true)}
            >
              <div style={{opacity:0.5}}>
                Connect Wallet
              </div>
            </div>
          </div>
        )}
      </div>
      <Router>
        <Routes>
          <Route
            path="/orcid/token/*"
            element={
              <AuthenticationFlow
                token={
                  window.location.href.split(
                    "/token/#"
                  )[1] /*It is safe to assume that the 1st item of the split is the token -- if not, nothing bad happens; the token will be rejected. 
                                                                                                    You may also be asking why we can't just get the token from the URL params. React router doesn't allow # in the URL params, so we have to do it manually*/
                }
                credentialClaim={"sub"}
                web2service={"ORCID"}
                desiredChain={desiredChain}
              />
            }
          />
          {/*Google has a different syntax and redirect pattern than ORCID*/}
          <Route
            path="/google/token/:token"
            element={<AuthenticationFlow credentialClaim={"email"} web2service={"Google"} desiredChain={desiredChain} />}
          />

          <Route
            path="/twitter/token/:token"
            element={<AuthenticationFlow credentialClaim={"creds"} web2service={"Twitter"} desiredChain={desiredChain} />}
          />
          <Route
            path="/GitHub/token/:token"
            element={<AuthenticationFlow credentialClaim={"creds"} web2service={"Github"} desiredChain={desiredChain} />}
          />
          <Route
            path="/discord/token/:token"
            element={<AuthenticationFlow credentialClaim={"creds"} web2service={"Discord"} desiredChain={desiredChain} />}
          />

          <Route path="/lookup/:web2service/:credentials" element={<Lookup desiredChain={desiredChain} />} />
          <Route path="/l/:web2service/:credentials" element={<Lookup desiredChain={desiredChain} />} />
          <Route path="/lookup" element={<Lookup />} />
          <Route path="/registry" element={<Registry desiredChain={desiredChain} />} />
          {/* <Route path='/private' element={<LitCeramic stringToEncrypt={JWTObject.header.raw + '.' + JWTObject.payload.raw}/>} /> */}
          <Route path={"/"} element={myHoloPage} />
          <Route path={"/myholo"} element={myHoloPage} />
        </Routes>
      </Router>
    </div>

    // </Auth0Provider>
  );
}

export default App;
