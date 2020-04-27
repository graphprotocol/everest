const fs = require('fs')
const ethers = require('ethers')
const parseArgs = require('minimist')
const path = require('path')

const abi = require('../abis/Everest.json').abi
const addresses = require('../addresses.json')
const categories = require('../conf/config.js').everestParams.categories
const charter = require('../conf/config.js').everestParams.charter

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

let { network, func, gasPrice, withdrawAmount } = parseArgs(process.argv.slice(2), {
    string: ['network', 'func', 'gasPrice', 'withdrawAmount']
})

if (!network || !func || !gasPrice) {
    console.error(`
    Usage: ${path.basename(process.argv[1])}
        --network        <string> - options: ropsten, mainnet
        --func           <string> - options:    updateCategories
                                                withdrawReserveBank
                                                updateVotingPeriodDuration
                                                updateCharter
        --gasPrice       <number> - in gwei (i.e. 5 = 5 gwei)
        --withdrawAmount <number> - [optional] - pass 2 to withdraw 2 DAI
    `)
    process.exit(1)
}

const overrides = {
    gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei')
}

const updateCategories = async (everest, networkString) => {
    const tx = await everest.updateCategories(categories, overrides)
    console.log(`  ..pending: https://${networkString}etherscan.io/tx/${tx.hash}`)
    const res = await tx.wait()
    console.log(`    success: https://${networkString}etherscan.io/tx/${res.transactionHash}`)
}

const updateCharter = async (everest, networkString) => {
    const tx = await everest.updateCharter(charter, overrides)
    console.log(`  ..pending: https://${networkString}etherscan.io/tx/${tx.hash}`)
    const res = await tx.wait()
    console.log(`    success: https://${networkString}etherscan.io/tx/${res.transactionHash}`)
}

const withdrawReserveBank = async (everest, networkString) => {
    withdrawAmount = ethers.utils.parseUnits(withdrawAmount, 'ether')
    const tx = await everest.withdraw(wallet.signingKey.address, withdrawAmount, overrides)
    console.log(`  ..pending: https://${networkString}etherscan.io/tx/${tx.hash}`)
    const res = await tx.wait()
    console.log(`    success: https://${networkString}etherscan.io/tx/${res.transactionHash}`)
}

const updateVotingPeriodDuration = async (everest, networkString) => {
    const tx = await everest.updateVotingPeriodDuration(600, overrides)
    console.log(`  ..pending: https://${networkString}etherscan.io/tx/${tx.hash}`)
    const res = await tx.wait()
    console.log(`    success: https://${networkString}etherscan.io/tx/${res.transactionHash}`)
}

const main = async () => {
    try {
        let providerEndpoint
        let everestAddress
        if (network == 'mainnet') {
            providerEndpoint = mainnnetProvider
            everestAddress = addresses.mainnet.everest
        } else if (network == 'ropsten') {
            providerEndpoint = ropstenProvider
            everestAddress = addresses.ropsten.everest
        } else {
            console.error(`ERROR: Please provide the correct network name`)
            process.exit(1)
        }

        const provider = new ethers.providers.JsonRpcProvider(providerEndpoint)
        const connectedWallet = new ethers.Wallet(wallet.signingKey.privateKey, provider)
        const everest = new ethers.Contract(everestAddress, abi, provider)
        const everestWithSigner = everest.connect(connectedWallet)
        const networkString = network == 'ropsten' ? 'ropsten.' : ''

        if (func == 'updateCategories') {
            console.log(`Updating categories to ${categories} on network ${network} ...`)
            updateCategories(everestWithSigner, networkString)
        } else if (func == 'updateCharter') {
            console.log(`Updating charter to ${charter} on network ${network} ...`)
            updateCharter(everestWithSigner, networkString)
        } else if (func == 'withdrawReserveBank') {
            console.log(`withdrawing ${withdrawAmount} DAI on network ${network} ...`)
            withdrawReserveBank(everestWithSigner, networkString)
        } else if (func == 'updateVotingPeriodDuration') {
            console.log(`updating voting period duration to 10 mins on network ${network} ...`)
            updateVotingPeriodDuration(everestWithSigner, networkString)
        } else {
            console.error(`ERROR: Please provide the correct function name`)
            process.exit(1)
        }
    } catch (e) {
        console.log(`  ..failed: ${e.message}`)
        process.exit(1)
    }
}

main()
