export const getAddress = async () => {
  let address = null
  if (window.ethereum !== undefined) {
    address = window.ethereum.selectedAddress
  } else if (window.web3 !== undefined) {
    const accounts = await window.web3.listAccounts()
    address = accounts[0]
  }
  return address
}

export const connectAccounts = async () => {
  let accounts = []
  if (window.ethereum !== undefined) {
    accounts = window.ethereum.enable()
  } else if (window.web3 !== undefined) {
    accounts = await window.web3.listAccounts()
  }
  return accounts
}

// TODO: change the event to chainChanged or networkChanged in 2020
// https://medium.com/metamask/no-longer-reloading-pages-on-network-change-fbf041942b44
export const metamaskAccountChange = callback => {
  if (typeof window.ethereum !== undefined && window.ethereum !== undefined) {
    window.ethereum.on('accountsChanged', accounts => {
      // document.location.reload()
      callback(accounts)
    })
  }
}
