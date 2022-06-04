import { useState, useEffect } from 'react'

// Button to return to a site that directed the user to holo via a "sign up with holo" link
const ReturnButton = () => {
  // const [style, setStyle] = useState()
  const [redirectingSiteUrl, setRedirectingSiteUrl] = useState()
  const [redirectingSiteTitle, setRedirectingSiteTitle] = useState()

  useEffect(() => {
    const siteUrlTemp = sessionStorage.getItem('signUpWithHoloSiteUrl')
    const siteTitleTemp = sessionStorage.getItem('signUpWithHoloSiteTitle')
    if (siteUrlTemp && siteTitleTemp) {
      setRedirectingSiteUrl(siteUrlTemp)
      setRedirectingSiteTitle(siteTitleTemp)
    }
  }, [])

  useEffect(() => {
    // Place this ReturnButton directly to the left of the lookup button at the top of the screen
    const lookupBtn = document.getElementsByClassName('w-inline-block small-center')[0]
    const lookupBtnRect = lookupBtn.getBoundingClientRect();
    const lookupBtnRight = lookupBtnRect.right;
    // setStyle({
    //   position: "absolute", 
    //   top:"0px", 
    //   right: `${lookupBtnRight + 1}px`, 
    //   maxHeight: "64px" 
    // })
  }, [])

  function handleClick() {
    sessionStorage.removeItem('signUpWithHoloSiteUrl');
    sessionStorage.removeItem('signUpWithHoloSiteTitle');
    window.location.href = redirectingSiteUrl;
  }

  return (
    <>
      {redirectingSiteUrl && redirectingSiteTitle &&
        <div href={redirectingSiteUrl} onClick={handleClick} className="x-button secondary">
          <div className="wallet-text">
            Return to {' ' + redirectingSiteTitle}
          </div>
        </div>
      }
    </>
  );
};

export default ReturnButton;
