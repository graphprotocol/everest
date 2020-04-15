/*
 * This script allows us to migration contract upgrades
 * Right now in V1 everest, we keep the Registry to be the persistent storage, while all other
 * contracts are upgradeble. We do this by allows the Registry to be owned.
 *
 * In Order to Upgrade the contracts, the following steps must be taken.
 * 1. Deploy a new Reserve Bank, owned by the new OWNER
 * 2. Deploy a new Everest, owned by the new OWNER
 * 3. Change the new Reserve Bank to be owned by the new Everest. This is done by calling
 *    everest.transferOwnershipReserveBank()
 * 4. Change the ownership of the Registry to be the new Everest. This is done by calling
 *    everest.transferOwnershipRegistry()
 * 5. Withdraw the funds from the old Everest, and send them to the new Everest.
 *
 * Note on the upgrade of the contracts
 *  - ChallengeIDs should start at the new uint from the previous everest. This should
 *    be read directly from the contract so no mistakes are made
 *  - If the application fee is changed, the reserve could be underfunded. Pay attention to
 *    this, and if necessary, top up the Reserve Bank with funds
 *  - Once ownership of the Registry is changed, no members can be registered through V1,
 *    since all changes to Registry require ownership to do so, so it effectively stops the
 *    V1 code from being able to sign up new members.
 *  - No members can exit because of ownership
 *  - No member can challenge because it tries to editChallengeID()
 *  - Submiting votes would work on existing challenges
 *  - resolving challenges would not work since it tried deleteMember() and editChallengeID()
 *  - IN SUMMARY - nothing works except voting on challenges that exist. It means a challenge
 *    that is currently in existence, is nullfied. It should no longer be displayed in the
 *    front end. The users who started the challenges should be manually refunded
 */

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

// Deploy a new Reserve Bank, owned by the new OWNER

// Deploy a new Everest, owned by the new OWNER

// Change the new Reserve Bank to be owned by the new Everest.

// Change the ownership of the Registry to be the new Everest.

// Withdraw the funds from the old Everest, and send them to the new Everest.

const withdrawReserveBank = async (provider, everestAddress) => {
    const signer = setup(provider, everestAddress)
    const tx = await signer.withdraw(wallet.signingKey.address, '2000000000000000000', overrides)
    console.log('TX: ', tx)

    const res = await tx.wait()

    console.log('RES: ', res)
}
