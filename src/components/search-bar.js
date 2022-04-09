import { useParams, Navigate, useNavigate } from 'react-router-dom'
import React, { useState } from 'react'

export const SearchBar = () => {
    let navigate = useNavigate()
    let params = useParams()
    let [credentials, setCredentials] = useState('')
    const search = () => {
        let web2Service = params.web2service || 'ORCID'; // Needn't be ORCID -- any web2service is fine. But this does feel hacky

        if(credentials.startsWith('@')){
            web2Service = 'Twitter'
        } else if(credentials.includes('@')){
            web2Service = 'Google'
        } else if(credentials.includes('-')){
            web2Service = 'ORCID'
        }
        navigate(`/lookup/${web2Service}/${credentials || 'nobody'}`)
    }
    return <>
        <div class="optin-form w-form">
            {/* TODO : this need not be a <form />*/}
          <form id="email-form" name="email-form" data-name="Email Form" method="get" class="form">
              <input onChange={e=>setCredentials(e.target.value)} type="email" class="text-field w-input" maxLength="256" name="email-3" data-name="Email 3" placeholder="Discover others by email, Twitter, etc." id="email-3" required="" />
            </form>
        </div>
        <div class="spacer-small"></div>
        <div class="btn-wrapper">
          <a onClick={search} class="x-button w-button">search now</a>
          <div class="v-spacer-small"></div>
          <div class="spacer-small mobile"></div>
          <a href="#" class="x-button secondary outline w-button">learn more</a>
        </div>
        </>
}