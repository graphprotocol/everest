import base from 'base-x'

export const ipfsHexHash = ipfsHash => {
  const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')
  return (
    '0x' +
    base58
      .decode(ipfsHash)
      .slice(2)
      .toString('hex')
  )
}
