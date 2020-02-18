/* global artifacts */

const Token = artifacts.require('./lib/Dai.sol')
const config = require('../conf/config.js')

module.exports = async (deployer, network) => {
    let tokenHolders
    let tokenMinter
    let chainID
    if (network === 'development') {
        tokenHolders = [
            // config.ganacheParams.wallets.zero(), Zero is minter, starts with 100M
            config.ganacheParams.wallets.one().signingKey.address,
            config.ganacheParams.wallets.two().signingKey.address,
            config.ganacheParams.wallets.three().signingKey.address,
            config.ganacheParams.wallets.four().signingKey.address
        ]
        tokenMinter = config.ganacheParams.wallets.zero().signingKey.address
        chainID = 9545
    } else {
        tokenHolders = [
            config.metamaskAddresses.one,
            config.metamaskAddresses.two,
            config.metamaskAddresses.three,
            config.metamaskAddresses.four
        ]
        tokenMinter = config.metamaskAddresses.zero
        if (network == 'ropsten') {
            chainID = 3
        } else if (network == 'rinkeby') {
            chainID = 4
        }
    }

    async function giveTokensTo(tokenHolders) {
        if (tokenHolders.length === 0) {
            return
        }
        const token = await Token.deployed()
        const tokenHolder = tokenHolders[0]

        const displayAmt = config.ropstenParams.amountToEachAccount.slice(
            0,
            config.ropstenParams.amountToEachAccount.length - parseInt(18, 10)
        )
        // eslint-disable-next-line no-console
        console.log(`Allocating ${displayAmt} DAI tokens to ` + `${tokenHolder}.`)
        await token.transfer(tokenHolder, config.ropstenParams.amountToEachAccount)
        giveTokensTo(tokenHolders.slice(1))
    }

    if (network !== 'mainnet') {
        // eslint-disable-next-line no-console
        console.log('Deploying token to a test network and minting 100M DAI.....')
        await deployer.deploy(Token, chainID)

        console.log(`Giving tokens to ${tokenHolders.length} accounts`)
        const token = await Token.deployed()

        // eslint-disable-next-line no-console
        await token.mint(tokenMinter, config.ropstenParams.supply)
        await giveTokensTo(tokenHolders)
    } else {
        // eslint-disable-next-line no-console
        console.log(
            'Deploying to mainnet, so skipping token deploy, and using token at ' +
                `${config.mainnetParams.daiAddress}.`
        )
    }
}
