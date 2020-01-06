/* global artifacts */

const Everest = artifacts.require('Everest.sol')
const Token = artifacts.require('MockToken.sol')
const config = require('../conf/config.js')
// const fs = require('fs')
// const Registry = artifacts.require('Registry.sol')
// const ReserveBank = artifacts.require('ReserveBank.sol')

module.exports = async (deployer, network, accounts) => {
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

    const params = config.everestParams
    await deployer.deploy(
        Everest,
        owner,
        params.approvedToken,
        params.votingPeriodDuration,
        params.challengeDeposit,
        params.fullMemberPeriodDuration,
        params.applicationFee,
        params.charter
    )

    // Not necessary for mainnet, since it will not be using the mock token
    if (network !== 'mainnet') {
        await approveEverestFor(accounts)
    }
}
