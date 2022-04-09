import GoogleLogin from 'react-google-login';
import {
  useNavigate,
  Navigate
} from 'react-router-dom';
/** ORCID **/
export const ORCIDLoginButton = (props)=>{
    return <a className="card-link"href='https://orcid.org/signin?response_type=token&redirect_uri=https:%2F%2Fwhoisthis.wtf/orcid/token/&client_id=APP-MPLI0FQRUVFEKMYX&scope=openid&nonce=whatever'>Link ORCID</a>
  }
  
/** Twitter **/
export const TwitterLoginButton = (props)=>{
    return <a className="card-link"href='https://localhost:8081/twitter/polygon/verify'>Link Twitter</a>
  }
  
  export const GitHubLoginButton = (props)=>{
    return <a className="card-link"href='https://localhost:8081/twitter/polygon/verify'>Link GitHub</a>
  }

/** Google **/
const InnerGoogleLoginButton = (renderProps)=> {
return <a className="card-link" 
            onClick={renderProps.onClick} 
            disabled={renderProps.disabled}
            >Link Google
        </a>
  }

// Provides a simple component, GoogleLoginButton, which wraps two more components: the GoogleLogin component from npm package, which renders a custom InnerGoogleLoginButton
  export const GoogleLoginButton = () => {
      const navigate = useNavigate()
      return <GoogleLogin 
                clientId='254984500566-3qis54mofeg5edogaujrp8rb7pbp9qtn.apps.googleusercontent.com'
                render={renderProps => <InnerGoogleLoginButton {...renderProps} />}
                onSuccess={r=>navigate(`/google/token/id_token=${r.tokenId}`)}
                />
        }