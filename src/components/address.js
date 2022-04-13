import { truncateAddress } from '../ui-helpers';
const Address = (props)=>{
    return <div className='address-truncated'>{truncateAddress(props.address)}</div>
}

export default Address;