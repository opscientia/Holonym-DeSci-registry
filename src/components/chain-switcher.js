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
    // Load the chain if possible
    if(!isLoading && chainParams[desiredChain] && activeChain?.id === parseInt(chainParams[desiredChain].chainId)){
      console.log('correct chain')
    } else {
      switchToChain(desiredChain, provider, switchNetwork);
    }
  }, [desiredChain, activeChain, isLoading, provider, switchNetwork]);
  console.log('desired chain ', desiredChain)
  return {desiredChain:desiredChain, setDesiredChain:setDesiredChain};
}

export const ChainSwitcher = () => {
  
  /* {chains.map((x) => (
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
  // }
  
}

export const ChainSwitcherModal = () => (
  null
)
