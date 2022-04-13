import { truncateAddress } from '../ui-helpers';
import userIcon from "../img/User.svg"
const Address = (props)=>{
    const switchAccounts = () =>{
        if(props.provider && props.provider.provider.request){
            props.provider.provider.request({
                method: 'wallet_requestPermissions',
                params: [{
                eth_accounts: {},
                }]
            });
    }
    
    }
    return <div class="nav-btn">
                {/* <a href="#" class="x-button secondary outline-menu w-button">connect wallet</a> */}
                <div onClick={switchAccounts} className="wallet-connected">
                    <img src={userIcon} loading="lazy" alt="" class="wallet-icon" />
                    <div class="wallet-text">{truncateAddress(props.address)}</div>
                </div>
            </div>
}

export default Address;