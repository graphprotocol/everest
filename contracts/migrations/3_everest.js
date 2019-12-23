/* global artifacts */

const Registry = artifacts.require('Registry.sol')
const Everest = artifacts.require('Everest.sol')
const Token = artifacts.require('MockToken.sol')
const ReserveBank = artifacts.require('ReserveBank.sol')
const config = require('../conf/config.js')

const fs = require('fs')

module.exports = (deployer, network, accounts) => {
    // Approve all token holders to allow everest to spend on their behalf
    async function approveRegistryFor(addresses) {
        const token = await Token.deployed()
        const everest = await Everest.deployed()
        const user = addresses[0]
        const balanceOfUser = await token.balanceOf(user)
        await token.approve(everest.address, balanceOfUser, {from: user})
        if (addresses.length === 1) {
            return true
        }
        return approveRegistryFor(addresses.slice(1))
    }

    return deployer
        .then(async () => {
            // if (network === 'ganache' || network === 'rinkeby') {
            //   config = JSON.parse(fs.readFileSync(`./conf/${process.argv[5]}.json`));
            // }

            const params = config.everestParams

            return deployer.deploy(
                Everest,
                params.owner,
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
                await approveRegistryFor(accounts)
            }
        })
        .catch(err => {
            throw err
        })
}
