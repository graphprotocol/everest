/* global artifacts */

const Token = artifacts.require('MockToken.sol')
const fs = require('fs')
const config = require('../conf/config.js')

module.exports = (deployer, network) => {
    let tokenHolders
    let tokenMinter
    if (network === 'development') {
        tokenHolders = config.token.tokenHolders
        tokenMinter = config.token.minter
    } else if (network == 'ropsten') {
        tokenHolders = config.token.ropstenTokenHolders
        tokenMinter = config.token.ropstenMinter
    }

    async function giveTokensTo(tokenHolders) {
        if (tokenHolders.length === 0) {
            return
        }
        const token = await Token.deployed()
        const tokenHolder = tokenHolders[0]

        const displayAmt = tokenHolder.amount.slice(
            0,
            tokenHolder.amount.length - parseInt(config.token.decimals, 10)
        )
        // eslint-disable-next-line no-console
        console.log(
            `Allocating ${displayAmt} ${config.token.symbol} tokens to ` + `${tokenHolder.address}.`
        )

        await token.transfer(tokenHolder.address, tokenHolder.amount)

        giveTokensTo(tokenHolders.slice(1))
    }

    if (config.token.deployToken) {
        console.log('Deploying token.....')

        deployer
            .deploy(
                Token,
                config.token.supply,
                config.token.name,
                config.token.decimals,
                config.token.symbol,
                tokenMinter.address
            )
            .then(async () => giveTokensTo(tokenHolders))
    } else {
        // eslint-disable-next-line no-console
        console.log(
            'skipping optional token deploy and using the token at address ' +
                `${config.token.address} on network ${network}.`
        )
    }
}
