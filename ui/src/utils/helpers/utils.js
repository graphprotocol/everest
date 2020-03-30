export const defaultImage = (path, number) => {
  const baseUri = `${window.__GATSBY_IPFS_PATH_PREFIX__ || ''}/${path}`
  // pick a pseudorandom number between 1 and number
  const num = Math.floor(Math.random() * number + 1)
  return `${baseUri}${num}.png`
}
