import wtf from "../wtf-configured";
import { desiredChain } from "../constants/desiredChain";

export const getHoloFromAddress = async (address) => {
  const response = await fetch(`https://sciverse.id/getHolo?address=${address}`);
  const holo_ = (await response.json())[desiredChain];
  return holo_;
};

export const getHoloFromCredentials = async (creds, service) => {
  let address = await wtf.addressForCredentials(creds, service.toLowerCase());
  console.log("wtf response", address);
  // let address = ''
  // if (props.service =='address') {
  //   address = props.lookupBy
  // }
  // else {
  //   const response = await fetch(`https://sciverse.id/addressForCredentials?credentials=${creds}&service=${service.toLowerCase()}`)
  //   address = await response.json()
  //   console.log('addresss at line 86 in lookup.js...', address)
  // }
  console.log("address", address);
  console.log("0xb1d534a8836fB0d276A211653AeEA41C6E11361E" == address);

  return await getHoloFromAddress(address);
};
