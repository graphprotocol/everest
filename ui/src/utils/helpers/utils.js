export const defaultImage = path => {
  const baseUri = `${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/${path}`
  // pick a pseudorandom number between 1 and 24
  const num = Math.floor(Math.random() * 24 + 1)
  return `${baseUri}${num}.png`
}
