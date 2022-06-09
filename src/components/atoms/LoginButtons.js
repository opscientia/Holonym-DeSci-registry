import { useState } from "react";
import GoogleLogin from "react-google-login";
import { useNavigate } from "react-router-dom";
import { appIDForChain, chainForAppID } from "../../constants/chainsAndAuds";
import { ChainSwitcherModal } from "../chain-switcher";
// import Refresh from '../img/refresh.svg';

const LoginButton = (props) => {
  const [modalShowing, setModalShowing] = useState(false)
  return (
    <>
      <a className="card-link" onClick={()=>setModalShowing(true)}>
        {props.creds ? "Update" : "Link"} {props.web2service}
      </a>
      <ChainSwitcherModal visible={modalShowing} setVisible={setModalShowing} onChainChange={(newChain)=>props.callback(newChain)} />
    </>
    )
}
export const ORCIDLoginButton = (props) => {
  console.log("lorcidp", props)
  return <LoginButton 
    web2service={"ORCID"} 
    callback={(newChain)=>{window.location.href=`https://orcid.org/signin?response_type=token&redirect_uri=https:%2F%2Fapp.holonym.id/orcid/token/&client_id=${appIDForChain.orcid[newChain]}&scope=openid&nonce=whatever`}}
 />
}
/** ORCID **/
export const ORCILoginButton = (props) => {

  return (
    <a
      className="card-link"
      href={`https://orcid.org/signin?response_type=token&redirect_uri=https:%2F%2Fapp.holonym.id/orcid/token/&client_id=${appIDForChain.orcid[props.desiredchain]}&scope=openid&nonce=whatever"`}
    >
      {props.creds ? "Update ORCID" : "Link ORCID"}
    </a>
  );
};

/** Twitter **/
export const TwitterLoginButton = (props) => {
  return (
    <a className="card-link" href={`https://holonym.id/auth/twitter/chain/${props.desiredchain}`}>
      {props.creds ? "Update Twitter" : "Link Twitter"}
    </a>
  );
};

/** GitHub **/
export const GitHubLoginButton = (props) => {
  return (
    <a className="card-link" href={`https://holonym.id/auth/github/chain/${props.desiredchain}`}>
      {props.creds ? "Update GitHub" : "Link GitHub"}
    </a>
  );
};

/** Discord **/
export const DiscordLoginButton = (props) => {
  return (
    <a className="card-link" href={`https://holonym.id/auth/discord/chain/${props.desiredchain}`}>
      {props.creds ? "Update Discord" : "Link Discord"}
    </a>
  );
};

/** Google **/
const InnerGoogleLoginButton = (props) => {
  console.log("propss", props);
  return (
    <a className="card-link" onClick={props.onClick} disabled={props.disabled}>
      {props.creds ? "Update Google" : "Link Google"}
    </a>
  );
};

// Provides a simple component, GoogleLoginButton, which wraps two more components: the GoogleLogin component from npm package, which renders a custom InnerGoogleLoginButton
export const GoogleLoginButton = (props) => {
  const navigate = useNavigate();
  return (
    <GoogleLogin
      clientId="254984500566-3qis54mofeg5edogaujrp8rb7pbp9qtn.apps.googleusercontent.com"
      render={(renderProps) => <InnerGoogleLoginButton {...renderProps} {...props} />}
      onSuccess={(r) => navigate(`/google/token/id_token=${r.tokenId}`)}
    />
  );
};
