/* global artifacts */

const Token = artifacts.require('dai.sol')
const config = require('../conf/config.js')

module.exports = async (deployer, network) => {
    let tokenHolders
    let tokenMinter
    let chainID
    if (network === 'development') {
        tokenHolders = config.token.ganacheTokenHolders
        tokenMinter = config.token.ganacheMinter.address
        chainID = 9854
    } else if (network == 'ropsten') {
        tokenHolders = config.token.testnetTokenHolders
        tokenMinter = config.token.testnetMinter.address
        chainID = 3
    } else if (network == 'rinkeby') {
        tokenHolders = config.token.testnetTokenHolders
        tokenMinter = config.token.testnetMinter.address
        chainID = 4
    }

    async function giveTokensTo(tokenHolders) {
        if (tokenHolders.length === 0) {
            return
        }
        const token = await Token.deployed()
        const tokenHolder = tokenHolders[0]

        const displayAmt = tokenHolder.amount.slice(0, tokenHolder.amount.length - parseInt(18, 10))
        // eslint-disable-next-line no-console
        console.log(`Allocating ${displayAmt} DAI tokens to ` + `${tokenHolder.address}.`)
        await token.transfer(tokenHolder.address, tokenHolder.amount)
        giveTokensTo(tokenHolders.slice(1))
    }

    if (config.token.deployTestingToken) {
        // eslint-disable-next-line no-console
        console.log('Deploying token to a test network and minting 100M DAI.....')
        await deployer.deploy(Token, chainID)

        console.log(`Giving tokens to ${tokenHolders.length} accounts`)
        const token = await Token.deployed()

        // eslint-disable-next-line no-console
        await token.mint(tokenMinter, config.token.supply)
        await giveTokensTo(tokenHolders)
    } else {
        // eslint-disable-next-line no-console
        console.log(
            'Deploying to mainnet, so skipping token deploy, and using token at ' +
                `${config.token.mainnetAddress}.`
        )
    }
}
