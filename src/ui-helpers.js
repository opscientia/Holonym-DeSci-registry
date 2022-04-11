// truncates 0x1234567890 to 0x12...90
export const truncateAddress = (address) =>`${address.slice(0,4)}...${address.slice(-2)}`