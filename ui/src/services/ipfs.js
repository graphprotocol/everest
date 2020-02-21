import base from 'base-x'
const ipfsClient = require('ipfs-http-client')

const client = {
  host: process.env.GATSBY_IPFS_HOST,
  port: process.env.GATSBY_IPFS_PORT || '',
  protocol: process.env.GATSBY_IPFS_PROTOCOL,
}

const ipfs = new ipfsClient(client)

// convert from ipfsHash to Hex string
export const ipfsHexHash = ipfsHash => {
  const base58 = base(
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  )
  return (
    '0x' +
    base58
      .decode(ipfsHash)
      .slice(2)
      .toString('hex')
  )
}

// convert to IPFS hash that starts with "Qm"
export const ipfsHash = hexString => {
  const base58 = base(
    '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',
  )
  let bytesString = '1220' + `${hexString}`.substring(2)
  let buffer = Buffer.from(bytesString, 'hex')
  return base58.encode(buffer)
}

export default ipfs
