import { desiredChain } from "../constants/desiredChain";

export const getHoloFromAddress = async (address) => {
  const response = await fetch(`https://sciverse.id/getHolo?address=${address}`);
  const holo_ = (await response.json())[desiredChain];
  return {...holo_, address: address};
};

export const getHoloFromCredentials = async (creds, service) => {
  const response = await fetch(`https://sciverse.id/addressForCredentials?credentials=${creds}&service=${service.toLowerCase()}`);
  const address = await response.json();
  return await getHoloFromAddress(address);
};

export const searchHolos = async (searchStr) => {
  const numAllowedAttempts = 3;
  let attemptNum = 0;
  while (attemptNum < numAllowedAttempts) {
    try {
      let resp = await fetch(`https://sciverse.id/searchHolos?searchStr=${searchStr}`);
      let holos = await resp.json();
      return holos;
    } catch (err) {
      attemptNum++;
    }
  }
  console.log(`Failed ${numAllowedAttempts} attempts to fetch search results for search "${searchStr}"`);
};

export const holoIsEmpty = (holo) => {
  return !Object.values(holo)?.some(x=>x)
}