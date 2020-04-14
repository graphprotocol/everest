const fs = require('fs')
const ethers = require('ethers')

const abi = require('../abis/Everest.json').abi
const addresses = require('../addresses.json')
const categories = require('../conf/config.js').everestParams.categories

const ropstenProvider = `https://ropsten.infura.io/v3/${fs
    .readFileSync(__dirname + '/../../../../private-keys/.infurakey.txt')
    .toString()
    .trim()}`

const mainnnetProvider = `https://mainnet.infura.io/v3/${fs
    .readFileSync(__dirname + '/../../../../private-keys/.infurakey.txt')
    .toString()
    .trim()}`

const mnemonic = fs
    .readFileSync(__dirname + '/../../../../private-keys/.privkey-metamask.txt')
    .toString()
    .trim()

const wallet = new ethers.Wallet.fromMnemonic(mnemonic)

const setup = (provider, everestAddress) => {
    let ethereum = new ethers.providers.JsonRpcProvider(provider)
    const everest = new ethers.Contract(everestAddress, abi, ethereum)
    const connectedWallet = new ethers.Wallet(wallet.signingKey.privateKey, ethereum)
    const everestWithSigner = everest.connect(connectedWallet)
    return everestWithSigner
}

const overrides = {
    // The price (in wei) per unit of gas
    gasPrice: ethers.utils.parseUnits('5.0', 'gwei')
}

const updateCategories = async (provider, everestAddress) => {
    const signer = setup(provider, everestAddress)
    const tx = await signer.updateCategories(categories, overrides)
    console.log(tx)

    await tx.wait()

    const newBytesValue = await signer.categories()
    console.log(newBytesValue + 'Should match ' + categories)
    console.log('success')
}

const withdrawReserveBank = async (provider, everestAddress) => {
    const signer = setup(provider, everestAddress)
    const tx = await signer.withdraw(wallet.signingKey.address, '2000000000000000000', overrides)
    console.log('TX: ', tx)

    const res = await tx.wait()

    console.log('RES: ', res)
}

// updateCategories(ropstenProvider, addresses.ropsten.everest)
withdrawReserveBank(mainnnetProvider, addresses.mainnet.everest)
