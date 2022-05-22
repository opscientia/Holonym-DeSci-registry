import { useParams, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";
import contractAddresses from "../constants/contractAddresses.json";
import { truncateAddress } from "../utils/ui-helpers.js";
import abi from "../constants/abi/VerifyJWTv2.json";
import { LitCeramic } from "./lit-ceramic.js";
import { InfoButton } from "./info-button";
import QRCode from "react-qr-code";
import { EditProfileButton } from "./edit-profile.js";
import MessageScreen from "./atoms/MessageScreen";
import Error from "./errors.js";
import { GoogleLoginButton, ORCIDLoginButton, TwitterLoginButton, GitHubLoginButton } from "./atoms/LoginButtons.js";
import Github from "../img/Github.svg";
import Google from "../img/Google.svg";
import CircleWavy from "../img/CircleWavy.svg";
import CircleWavyCheck from "../img/CircleWavyCheck.svg";
import Orcid from "../img/Orcid.svg";
import TwitterLogo from "../img/TwitterLogo.svg";
import Share from "../img/Share.svg";
import { useAccount, useSigner, useProvider } from "wagmi"; // NOTE: Need wagmi for: account, provider, connect wallet
import { Modal } from "./atoms/Modal.js";
import { fixedBufferXOR as xor, getParamsForVerifying, hexToString, parseJWT } from "wtfprotocol-helpers";
const { ethers } = require("ethers");

const JWTFromURL = function (url) {
  if (!url) {
    return null;
  }
  let parsedToJSON = {};
  url.split("&").map((x) => {
    let [key, value] = x.split("=");
    parsedToJSON[key] = value;
  });
  return parsedToJSON["id_token"];
};

const parseJWTFromURL = function (url) {
  return parseJWT(JWTFromURL(url));
};

const ignoredFields = ["azp", "kid", "alg", "at_hash", "aud", "auth_time", "iss", "exp", "iat", "jti", "nonce", "email_verified", "rand"]; //these fields should still be checked but just not presented to the users as they are unecessary for the user's data privacy and confusing for the user
// React component to display (part of) a JWT in the form of a javscript Object to the user
const DisplayJWTSection = (props) => {
  return (
    <>
      {Object.keys(props.section).map((key) => {
        if (ignoredFields.includes(key)) {
          return null;
        } else {
          let field = key;
          let value = props.section[key];
          // give a human readable name to important field:
          if (field === "creds") {
            field = "Credentials";
          }
          if (field === "sub") {
            field = `${props.web2service} ID`;
          }
          if (field === "given_name") {
            field = "Given First Name";
          }
          if (field === "family_name") {
            field = "Given Last Name";
          }
          if (field === "picture") {
            value = <img style={{ borderRadius: "7px" }} src={value} alt="" />;
          }
          // capitalize first letter:
          field = field.replace("_", " ");
          field = field[0].toUpperCase() + field.substring(1);

          return (
            <div>
              <h3>{field}</h3>
              <p class="identity-text">{value}</p>
            </div>
          );
        }
      })}
    </>
  );
};

let pendingProofPopup = false;

const InnerAuthenticationFlow = (props) => {
  const params = useParams();
  const navigate = useNavigate();
  const { data: account } = useAccount();
  const { data: signer } = useSigner();
  const provider = useProvider();
  let tokenURL = params.token || props.token; // Due to redirects with weird urls from some OpenID providers, there can't be a uniform way of accessing the token from the URL, so props based on window.location are used in weird situations
  const vjwt = (props.web2service && signer) ? new ethers.Contract(contractAddresses[props.web2service], abi, signer) : null;
  const [step, setStep] = useState(null);
  const [JWTText, setJWTText] = useState("");
  const [JWTObject, setJWTObject] = useState(""); //a fancy version of the JWT we will use for this script
  const [params4Verifying, setParams4Verifying] = useState({});
  const [displayMessage, setDisplayMessage] = useState("");
  const [onChainCreds, setOnChainCreds] = useState(null);
  const [shareModal, setShareModal] = useState(false);
  const [txHash, setTxHash] = useState(null);
  const [credentialsRPrivate, setCredentialsRPrivate] = useState(false);
  const myUrl = `https://whoisthis.wtf/lookup/address/${account?.address}`;
  const defaultHolo = {
    google: null,
    orcid: null,
    github: null,
    twitter: null,
  };
  const [holo, setHolo] = useState(defaultHolo);
  // Load the user's Holo when the page loads
  useEffect(() => {
    async function getAndSetHolo() {
      try {
        const holoIsEmpty = Object.values(holo).every((x) => !x);
        if (!holoIsEmpty || !account?.address) {
          return;
        } //only update holo if it 1. hasn't already been updated, & 2. there is an actual address provided. otherwise, it will waste a lot of RPC calls
        const response = await fetch(`https://sciverse.id/getHolo?address=${account?.address}`);
        let holo_ = (await response.json())[props.desiredChain];
        setHolo({
          ...defaultHolo,
          google: holo_.google,
          orcid: holo_.orcid,
          github: holo_.github,
          twitter: holo_.twitter,
          name: holo_.name,
          bio: holo_.bio,
        });
      } catch (err) {
        console.error("Error:", err);
      }
    }
    getAndSetHolo();
  }, [props.desiredChain]);

  let revealBlock = 0; //block when user should be prompted to reveal their JWT
  // useEffect(()=>{if(token){setJWTText(token); setStep('userApproveJWT')}}, []) //if a token is provided via props, set the JWTText as the token and advance the form past step 1

  // if a token is already provided, set the step to user approving the token
  if (tokenURL) {
    if (JWTText === "") {
      console.log(tokenURL, "token url!!!!!!!!!!!!!!!!!!!!!", JWTFromURL(tokenURL));
      setJWTText(JWTFromURL(tokenURL));
      console.log("new JWT text", JWTFromURL(tokenURL))
      setStep("userApproveJWT");
    }
  } else {
    if (step) {
      setStep(null);
    }
  }

  useEffect(() => {
    async function setJWTAndParams() {
      if (!(JWTText && props && props.credentialClaim && vjwt)) {
        return;
      }
      setJWTObject(parseJWT(JWTText));
      setParams4Verifying(await getParamsForVerifying(vjwt, JWTText, props.credentialClaim, "ethersjs"));
    }
    setJWTAndParams();
  }, [JWTText, params, props, signer]);

  if (!account) {
    return "Please connect your wallet";
  }

  const commitJWTOnChain = async (credentialClaim) => {
    setDisplayMessage(
      "After you submit this transaction, you will receive another transaction in about 10 seconds once the block is mined. Once it's mined, you'll see a new popup to finish verification"
    );
    // xor the values as bytes (without preceding 0x)
    const commitments = params4Verifying.generateCommitments(account.address);
    try {
      let tx = await vjwt.commitJWTProof(...commitments);
      revealBlock = (await provider.getBlockNumber()) + 1;
      let revealed = false;
      provider.on("block", async () => {
        if ((await provider.getBlockNumber()) >= revealBlock && !revealed) {
          setStep("waitingForBlockCompletion");
          revealed = true;
        }
      });
    } catch (error) {
      console.log("commitment eror", error);
      props.errorCallback(error.data?.message || error.message);
    }

    // setStep('waitingForBlockCompletion')
  };

  // credentialField is 'email' for gmail and 'sub' for orcid. It's the claim of the JWT which should be used as an index to look the user up by
  const proveIKnewValidJWT = async () => {
    const p4v = params4Verifying.verifyMeContractParams();
    // Don't reveal unless params were successfully committed:
    let [bound, unbound] = params4Verifying.generateCommitments(account.address)
    console.log(vjwt.commitments(bound))
    try {
      let tx = await vjwt.verifyMe(...p4v);
      setTxHash(tx.hash);
      return tx;
    } catch (error) {
      props.errorCallback(error.data?.message || error.message);
    }
  };

  // Commenting out anonymous credentials for now
  // const submitAnonymousCredentials = async (vjwt, JWTObject) => {
  //   let message = JWTObject.header.raw + '.' + JWTObject.payload.raw
  //   let sig = JWTObject.signature.decoded
  //   try {
  //     let tx = await vjwt.linkPrivateJWT(ethers.BigNumber.from(sig), ethers.utils.sha256(ethers.utils.toUtf8Bytes(message)))
  //     setTxHash(tx.hash)
  //     return tx
  //   } catch (error) {
  //     props.errorCallback(error.data?.message || error.message)
  //   }

  // }

  // listen for the transaction to go to the mempool
  // props.provider.on('pending', async () => console.log('tx'))

  switch (step) {
    case "waitingForBlockCompletion":
      if (!pendingProofPopup) {
        pendingProofPopup = true;
        // this should be multiple functions eventually instead of convoluded nested loops
        if (credentialsRPrivate) {
          // Commenting out anonymous credentials for now
          // submitAnonymousCredentials(vjwt, JWTObject).then(tx => {
          //   props.provider.once(tx, async () => {
          //     console.log('WE SHOULD NOTIFY THE USER WHEN THIS FAILS')
          //     // setStep('success');
          //   })
          // })
        } else {
          proveIKnewValidJWT().then((tx) => {
            provider.once(tx, async () => {
              await setOnChainCreds(hexToString(await vjwt.credsForAddress(account.address)));
              setStep("success");
            });
          });
        }
      }
      return credentialsRPrivate ? (
        <LitCeramic provider={provider} stringToEncrypt={JWTObject.header.raw + "." + JWTObject.payload.raw} />
      ) : (
        <MessageScreen msg="Waiting for block to be mined" />
      );
    case "success":
      // for some reason, onChainCreds updates later on Gnosis, so adding another fallback option for taking it off-chain (otherwise it will say verification failed when it probably hasn't failed; it just isn't yet retrievable)
      console.log("NU CREDS", JWTObject.payload.parsed[props.credentialClaim]);
      let creds = onChainCreds || JWTObject.payload.parsed[props.credentialClaim];
      console.log(`https://whoisthis.wtf/lookup/${props.web2service}/${creds}`);
      return onChainCreds ? (
        <div className="x-section bg-img wf-section" style={{ width: "100vw" }}>
          <div data-w-id="68ec56c7-5d2a-ce13-79d0-42d74e6f0829" className="x-container w-container">
            <div className="x-wrapper no-flex">
              <div className="spacer-large larger"></div>
              <h1 className="h1 small">Your identity is successfully verified</h1>
              <div className="spacer-small"></div>
              <div className="identity-wrapper">
                <div className="identity-div-1">
                  <div className="card-block">
                    <div className="card-heading">
                      <h3 className="h3 no-margin">{props.web2service + " ID"}</h3>
                      <img src={CircleWavyCheck} loading="lazy" alt="" className="verify-icon" />
                    </div>
                    <div className="spacer-xx-small"></div>
                    <p className="identity-text">{creds}</p>
                  </div>
                </div>
              </div>
              <div className="spacer-small"></div>
              <div className="identity-verified-btn-div">
                {/* <a href="#" className="x-button secondary outline w-button">view tranaction</a> */}
                {/* <div className="spacer-x-small"></div> */}
                <a href={`/myholo`} className="x-button w-button">
                  Go to my Holo
                </a>
                <div className="spacer-x-small"></div>
                <a href={`/`} className="x-button secondary outline w-button">
                  View All Holos
                </a>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="warning">Failed to verify JWT on-chain</p>
      );

    case "userApproveJWT":
      if (!JWTObject) {
        return "waiting for token to load";
      }
      vjwt.kid().then((kid) => {
        if (JWTObject.header.parsed.kid !== kid) {
          console.log("kid", JWTObject.header.parsed.kid, kid);
          props.errorCallback(
            <p>
              KID does not match KID on-chain. This likely means {props.web2service} has rotated their keys and those key IDs need to be updated
              on-chain. Please check back later. We would appreciate it if you could email{" "}
              <a href="mailto:wtfprotocol@gmail.com">wtfprotocol@gmail.com</a> about this error so we can get {props.web2service} up and running{" "}
            </p>
          );
        }
      });

      return displayMessage ? (
        <MessageScreen msg={displayMessage} />
      ) : (
        <div className="bg-img x-section wf-section" style={{ width: "100vw" }}>
          <div className="x-container w-container">
            <div className="x-wrapper small-center">
              <div className="spacer-small"></div>
              <div class="x-wrapper no-flex">
                <div class="spacer-large larger"></div>
                <h1 class="h1">Confirm Identity</h1>
                <h4 className="p-1 white">
                  Confirm you would like to publicly link your address <code>{account ? truncateAddress(account.address) : null}</code> and its
                  history with{" "}
                </h4>
                <DisplayJWTSection section={JWTObject.payload.parsed} web2service={props.web2service} />
              </div>
              <div class="spacer-medium"></div>
              <a
                href="#"
                class="x-button secondary"
                onClick={async () => {
                  await commitJWTOnChain(JWTObject);
                }}
              >
                submit public holo
              </a>
              <div class="spacer-small"></div>
              <div class="identity-info-div"></div>
            </div>
          </div>
        </div>
      );
    /*Date.now() / 1000 > JWTObject.payload.parsed.exp ? 
                    <p className='success'>JWT is expired ✓ (that's a good thing)</p> 
                    : 
                    <p className='warning'>WARNING: Token is not expired. Submitting it on chain is dangerous</p>}*/
    /*Header
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
                    } */

    default:
      return (
        <div className="bg-img x-section wf-section" style={{ width: "100vw" }}>
          <div className="x-container w-container">
            <div className="x-wrapper small-center">
              <div className="spacer-small"></div>
              <h1 className="h1">Your Public Profile</h1>
              <h2 className="p-1 white big">Define your Holonym by linking your accounts to the blockchain.</h2>
              <div className="spacer-medium"></div>
              <div className="x-card small">
                <div className="card-heading">
                  <h3 className="h3 no-margin">
                    {holo.name || "Your Name"}
                    <p className="no-margin">{holo.bio || "Your bio"}</p>
                  </h3>
                  <EditProfileButton {...props} holo={holo} />
                </div>
                {/* <img src={profile} loading="lazy" alt="" style={{textAlign: "left"}} /> */}

                <div className="spacer-small"></div>

                <div className="card-heading">
                  <h3 id="w-node-_7e19a9c8-ff94-4387-04bd-6aaf6d53a8ea-b12b29e5" className="h3 no-margin">
                    Link your profiles
                  </h3>
                  <InfoButton
                    text={`This will link your blockchain address, ${props.account}, to your Web2 accounts! Please be careful and only submit credentials you want visible in the "blockchain yellowpages." You will be guided through a process to link the credentials on-chain 💥 🌈 🤩 `}
                  />
                </div>
                <div className="spacer-small"></div>
                <div className="card-text-wrapper">
                  <div className="card-text-div">
                    <img src={Google} loading="lazy" alt="" className="card-logo" />
                    <div className="card-text">{holo.google || "youremail@gmail.com"}</div>
                    <GoogleLoginButton creds={holo.google} />
                  </div>
                  <img src={holo.google ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
                </div>
                <div className="spacer-x-small"></div>
                <div className="card-text-wrapper">
                  <div className="card-text-div">
                    <img src={Orcid} loading="lazy" alt="" className="card-logo" />
                    <div className="card-text">{holo.orcid || "xxxx-xxxx-xxxx-xxxx"}</div>
                    <ORCIDLoginButton creds={holo.orcid} />
                  </div>
                  <img src={holo.orcid ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
                </div>
                <div className="spacer-x-small"></div>
                <div className="card-text-wrapper">
                  <div className="card-text-div">
                    <img src={TwitterLogo} loading="lazy" alt="" className="card-logo" />
                    <div className="card-text">{`@${holo.twitter || "twitterusername"}`}</div>
                    <TwitterLoginButton creds={holo.twitter} />
                  </div>
                  <img src={holo.twitter ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
                </div>
                <div className="spacer-x-small"></div>
                <div className="card-text-wrapper">
                  <div className="card-text-div">
                    <img src={Github} loading="lazy" alt="" className="card-logo" />
                    <div className="card-text">{`@${holo.github || "githubusername"}`}</div>
                    <GitHubLoginButton creds={holo.github} />
                  </div>
                  <img src={holo.github ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" className="card-status" />
                </div>
              </div>
              <div className="spacer-large larger"></div>
              <div className="spacer-medium"></div>
              {/* Share button: copies link and makes QR for it */}
              <div
                className="x-wrapper small-center animation0"
                onClick={() => {
                  navigator.clipboard.writeText(myUrl);
                  setShareModal(true);
                }}
              >
                <h3>Share</h3>
                <img src={Share} loading="lazy" alt="" className="card-logo" />
              </div>
              {/* <a onClick className="x-button secondary"><img src={QR} /></a> */}
              {/* <a href="#" className="x-button secondary w-button">continue</a>
        <a href="#" className="x-button secondary no-outline w-button">Learn more</a> */}
            </div>
          </div>
          <Modal visible={shareModal} setVisible={setShareModal} blur={true}>
            <div className="x-wrapper small-center" style={{ padding: "0px", minWidth: "285px" }}>
              <h5>Your link</h5>
              <textarea style={{ width: "100%", height: "150px" }} type="email" class="text-field w-input" value={myUrl} />
              <p className="success">✓ Copied to clipboard</p>
              <h5>Your QR</h5>
              <QRCode value={myUrl} />
            </div>
          </Modal>
        </div>
      );
  }
};

const AuthenticationFlow = (props) => {
  const [error, setError] = useState();
  // return <Error msg={`We are doing some maintenance`} />
  return error ? <Error msg={error} /> : <InnerAuthenticationFlow {...props} errorCallback={(err) => setError(err)} />;
};

export default AuthenticationFlow;
