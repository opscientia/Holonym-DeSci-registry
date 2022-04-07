import React, { useState, useEffect } from 'react'

// this should perhaps be in its own file
import Github from '../img/Github.svg';
import Google from '../img/Google.svg';
import CircleWavy from '../img/CircleWavy.svg';
import CircleWavyCheck from '../img/CircleWavyCheck.svg';
import Orcid from '../img/Orcid.svg';
import TwitterLogo from '../img/TwitterLogo.svg';
import profile from '../img/profile.svg'
const icons = {
    google : Google,
    github : Github,
    orcid : Orcid,
    twitter : TwitterLogo

}

// this should perhaps be in a separate file
const linkFor = (service, username) => {
    switch(service) {
        case 'google' : 
            return 'mailto:' + username
        case 'orcid' : 
            return 'https://orcid.org/' + username
        case 'twitter' : 
            return 'https://twitter.com/' + username
        case 'github' : 
            return 'https://github.com/' + username
    }
}

export const BigCard = (props) => {
return <div class="x-card">
        <div class="id-card profile">
        <div class="id-card-1"><img src={profile} loading="lazy" alt="" class="id-img" /></div>
        <div class="id-card-2">
            <div class="id-profile-name-div">
            <h3 id="w-node-_0efb49bf-473f-0fcd-ca4f-da5c9faeac9a-4077819e" class="h3 no-margin">{props.holo.name}</h3>
            </div>
            <div class="spacer-xx-small"></div>
            <p class="id-designation">{props.holo.bio}</p>
        </div>
        </div>
        <div class="spacer-small"></div>
        <div class="spacer-small"></div>
        {Object.keys(props.holo).map(k => {
            if(k != 'name' && k != 'bio') {
                return <>
                    <div class="card-text-div"><img src={icons[k]} loading="lazy" alt="" class="card-logo" />
                        <div class="card-text">{props.holo[k] || 'Not listed'}</div>
                        <img src={props.holo[k] ? CircleWavyCheck : CircleWavy} loading="lazy" alt="" class="id-verification-icon" />
                    </div>
                    <div class="spacer-x-small"></div>
                </>
            }
        })}
    </div>
}


export const SmallCard = (props) => {
    return <div class="x-card">
            <div class="id-card profile">
            <div class="id-card-1"><img src={profile} loading="lazy" alt="" class="id-img" /></div>
            <div class="id-card-2">
                <div class="id-profile-name-div">
                <h3 id="w-node-_0efb49bf-473f-0fcd-ca4f-da5c9faeac9a-4077819e" class="h3 no-margin">{props.holo.name}</h3>
                </div>
                <div class="spacer-xx-small"></div>
                <p class="id-designation">{props.holo.bio}</p>
            </div>
            </div>
            {Object.keys(props.holo).map(k => {
                if(props.holo[k] && (k != 'name') && (k != 'bio')) {
                    return <a href={linkFor(k, props.holo[k])}>
                                <img src={icons[k]} style={{paddingLeft:'30px'}}loading="lazy" alt="" class="card-logo" />
                            </a>
                }
            })}
        </div>
    }