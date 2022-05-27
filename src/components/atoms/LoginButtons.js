import GoogleLogin from "react-google-login";
import { useNavigate } from "react-router-dom";

// import Refresh from '../img/refresh.svg';

/** ORCID **/
export const ORCIDLoginButton = (props) => {
  return (
    <a
      className="card-link"
      href="https://orcid.org/signin?response_type=token&redirect_uri=https:%2F%2Fapp.holonym.id/orcid/token/&client_id=APP-MPLI0FQRUVFEKMYX&scope=openid&nonce=whatever"
    >
      {props.creds ? "Update ORCID" : "Link ORCID"}
    </a>
  );
};

/** Twitter **/
export const TwitterLoginButton = (props) => {
  return (
    <a className="card-link" href="https://holonym.id/twitter/gnosis/verify">
      {props.creds ? "Update Twitter" : "Link Twitter"}
    </a>
  );
};

/** GitHub **/
export const GitHubLoginButton = (props) => {
  return (
    <a className="card-link" href="https://holonym.id/auth/github">
      {props.creds ? "Update GitHub" : "Link GitHub"}
    </a>
  );
};

/** Discord **/
export const DiscordLoginButton = (props) => {
  return (
    <a className="card-link" href="https://holonym.id/auth/discord">
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
