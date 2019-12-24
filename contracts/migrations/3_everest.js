/* global artifacts */

const Registry = artifacts.require('Registry.sol')
const Everest = artifacts.require('Everest.sol')
const Token = artifacts.require('MockToken.sol')
const ReserveBank = artifacts.require('ReserveBank.sol')
const config = require('../conf/config.js')

const fs = require('fs')

module.exports = (deployer, network, accounts) => {
    // Approve all token holders to allow everest to spend on their behalf
    async function approveEverestFor(addresses) {
        const token = await Token.deployed()
        const everest = await Everest.deployed()
        const user = addresses[0]
        const balanceOfUser = await token.balanceOf(user)
        await token.approve(everest.address, balanceOfUser, { from: user })
        if (addresses.length === 1) {
            return true
        }
        return approveEverestFor(addresses.slice(1))
    }

    let owner
    if (network === 'development') {
        owner = config.everestParams.owner
    } else if (network === 'ropsten') {
        owner = config.everestParams.ropstenOwner
    }

    return deployer
        .then(async () => {
            const params = config.everestParams
            return deployer.deploy(
                Everest,
                owner,
                params.approvedToken,
                params.votingPeriodDuration,
                params.challengeDeposit,
                params.whitelistPeriodDuration,
                params.applicationFee,
                params.charter
            )
        })
        .then(async () => {
            if (network !== 'mainnet') {
                await approveEverestFor(accounts)
            }
        })
        .catch(err => {
            throw err
        })
}
