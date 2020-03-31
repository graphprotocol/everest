const fs = require('fs')
const ethers = require('ethers')

const abi = require('../abis/Everest.json').abi
const addresses = require('../addresses.json')
const categories = require('../conf/config.js').everestParams.categories

const ropstenProvider = `https://ropsten.infura.io/v3/${fs
    .readFileSync(__dirname + '/../../../../private-keys/.infurakey.txt')
    .toString()
    .trim()}`

const mnemonic = fs
    .readFileSync(__dirname + '/../../../../private-keys/.privkey-metamask.txt')
    .toString()
    .trim()

let ethereum = new ethers.providers.JsonRpcProvider(ropstenProvider)

const everest = new ethers.Contract(addresses.ropsten.everest, abi, ethereum)

const wallet = new ethers.Wallet.fromMnemonic(mnemonic)
const connectedWallet = new ethers.Wallet(wallet.signingKey.privateKey, ethereum)

const everestWithSigner = everest.connect(connectedWallet)

const overrides = {
    // The price (in wei) per unit of gas
    gasPrice: ethers.utils.parseUnits('25.0', 'gwei')
}

const callEverest = async () => {
    const tx = await everestWithSigner.updateCategories(categories, overrides)
    console.log(tx)

    await tx.wait()

    const newBytesValue = await everestWithSigner.categories()
    console.log(newBytesValue + "Should match " + categories)
    console.log('success')
}

callEverest()
