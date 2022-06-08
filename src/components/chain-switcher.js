import { useState, useEffect } from "react";
import { useConnect, useProvider, useNetwork } from "wagmi";
import chainParams from "../constants/chainParams.json";
// Adds a 
const switchToChain = (desiredChain, provider, switchNetworkFallback) => {
  // First try it with the given provider argument
  try {
    // make sure provider exists and has request method
    // NOTE : may need to put "|| provider.provider.request" in this if statement 
    if(!provider || !provider.request){return}
    provider.request({
            method: "wallet_addEthereumChain",
            params: [chainParams[desiredChain]]
          }
  )
  } catch (err) {
    // Otherwise, try it with wagmi
    try {
      switchNetworkFallback(
        parseInt(chainParams[desiredChain].chainId)
      )
    } catch (switchNetworkError) {
      // If both times resulted in an error, could not successfully switch chains
      throw new Error(`could not switch to ${desiredChain} chain. Please manually switch to ${desiredChain}`);
    }
  }
  
}
// Hook for setting a global desired chain and adding/switching to the chain whenever it is changed
export const useDesiredChain = () => {
  const [desiredChain, setDesiredChain] = useState(null);
  const [desiredChainActive, setDesiredChainActive] = useState(false);
  // const provider = useProvider(); //couldn't get this to work easily
  const provider = window.ethereum
  const { connect, connectors, error, isConnecting, pendingConnector } = useConnect();
  const {
    activeChain,
    chains,
    isLoading,
    pendingChainId,
    switchNetwork,
  } = useNetwork();
  // useEffect(()=>setDesiredChain(desiredChain), [desiredChain])
  useEffect(() => {
    // Is desired chain already active?
    if(!isLoading && chainParams[desiredChain] && activeChain?.id === parseInt(chainParams[desiredChain].chainId)){
      setDesiredChainActive(true)
    } else {
      switchToChain(desiredChain, provider, switchNetwork);
    }
  }, [desiredChain, activeChain, isLoading, provider, switchNetwork]);
  console.log('desired chain ', desiredChain)
  return {desiredChain:desiredChain, setDesiredChain:setDesiredChain, desiredChainActive:desiredChainActive, desiredChainId:chainParams[desiredChain]?.chainId};
}

export const ChainSwitcher = () => {
  
  return (
  <div className="x-section product wf-section bg-img">
    <div className="x-container product w-container">
      <div className="x-pre-wrapper">
        <h1 className="h1">Select the Chain</h1>
        <p className="p-big">Choose your chain to verify your identity</p>
      </div>
      <div className="spacer-medium"></div>
      <div className="x-wrapper grid benefits">
        <a className="x-card blue-yellow w-inline-block"><img src="../images/Gnosis.png" loading="lazy" alt="" className="card-img small" />
          <h2 className="h2-small">Gnosis Chain</h2>
          <div className="text-link">Buy xDAI</div>
          <p className="p-2 white">Avg. Gas - $0.1 - $0.2<br />Holo Fees - $0.1</p>
          <p className="p-2 white"><strong>Est. Total Cost - $2/month</strong></p>
        </a>
        <a className="x-card blue-yellow w-inline-block"><img src="../images/Polygon.png" loading="lazy" alt="" className="card-img small" />
          <h2 className="h2-small">Mumbai Testnet</h2>
          <div className="text-link">Buy MATIC</div>
          <p className="p-2 white">Avg. Gas - $0.1 - $0.2<br />Holo Fees - $0.1</p>
          <p className="p-2 white"><strong>Est. Total Cost - $2/month</strong></p>
        </a>
        <div className="x-card blue-yellow disable"><img src="../images/Polygon.png" loading="lazy" alt="" className="card-img small b-w" />
          <h2 className="h2-small disable">Polygon Mainet</h2>
          <a className="text-link disable">Buy MATIC</a>
          <p className="p-2">Avg. Gas - $0.1 - $0.2<br />Holo Fees - $0.1</p>
          <p className="p-2"><strong>Est. Total Cost - $2/month</strong></p>
          <div className="chain-coming-soon"></div>
          <div className="blur-text-overlay">
            <h3 className="blur-text-heading">Coming Soon</h3>
          </div>
        </div>
        <div className="x-card blue-yellow disable"><img src="../images/Ethereum.png" loading="lazy" alt="" className="card-img small" />
          <h2 className="h2-small disable">Ethereum Chain</h2>
          <a className="text-link disable">Buy ETH</a>
          <p className="p-2">Avg. Gas - $20 - $100<br />Holo Fees - $10</p>
          <p className="p-2"><strong>Est. Total Cost - $40/month + Gas</strong></p>
          <div className="chain-coming-soon"></div>
          <div className="blur-text-overlay">
            <h3 className="blur-text-heading">Coming Soon</h3>
          </div>
        </div>
      </div>
    </div>
  </div>
  )
}

export const ChainSwitcherModal = () => (
  null
)

/* /* {chains.map((x) => (
        <button
          disabled={!switchNetwork || x.id === activeChain?.id}
          key={x.id}
          onClick={() => switchNetwork?.(280)}
        >
          {x.name}
          {isLoading && pendingChainId === x.id && ' (switching)'}
        </button>
      ))} */
      
  
    // try {
    //   switchNetwork?.(desiredChain.chainId)
    // } catch(err) {
    //   console.log(err)
    // }
    
  // if(! (activeChain?.id === parseInt(chainParams[desiredChain].chainId))){
  //   myHoloPage = <h1>Switching to {desiredChain}...</h1>
  // } */}