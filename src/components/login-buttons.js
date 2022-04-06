import GoogleLogin from 'react-google-login';
import orcidImage from '../img/orcid32.png';
import googleImage from '../img/google32.png';
/** ORCID **/
export const ORCIDLoginButton = (props)=>{
    return <a style={{
      height: '64px',
      width: '256px',
      textDecoration : 'none', 
      backgroundColor: 'rgb(167,206,51)',
      color: 'white',
      borderRadius: '10px',
      fontSize: '21px',
      margin: '10px'
      // border: '3px solid red'
      }} 
      href='https://orcid.org/signin?response_type=token&redirect_uri=https:%2F%2Fwhoisthis.wtf/orcid/token/&client_id=APP-MPLI0FQRUVFEKMYX&scope=openid&nonce=whatever'>
        <img src={orcidImage} style={{marginTop: '10px', border: '3px solid white', borderRadius: '30px'}}></img>
        <span style={{position: 'relative', top: '10%'}}> Login with ORCID</span>
      </a>
  }

/** Google **/
const InnerGoogleLoginButton = (renderProps)=> {
  return <a style={{
    height: '64px',
    width: '256px',
    textDecoration : 'none', 
    backgroundColor: 'white',
    color: 'grey',
    borderRadius: '10px',
    fontSize: '21px',
    margin: '10px'
    // border: '3px solid red'
    }} 
    onClick={renderProps.onClick} disabled={renderProps.disabled}>
      <img src={googleImage} style={{marginTop: '10px', border: '3px solid white', borderRadius: '30px'}}></img>
      <span style={{position: 'relative', top: '10%'}}> Login with Google</span>
    </a>
  }

// Provides a simple component, GoogleLoginButton, which wraps two more components: the GoogleLogin component from npm package, which renders a custom InnerGoogleLoginButton
  export const GoogleLoginButton = () => {
      return <GoogleLogin 
                clientId='254984500566-3qis54mofeg5edogaujrp8rb7pbp9qtn.apps.googleusercontent.com'
                render={renderProps => <InnerGoogleLoginButton {...renderProps} />}
                />
        }