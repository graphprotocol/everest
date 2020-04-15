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
const parseArgs = require('minimist')
const path = require('path')

const everestBuild = require('../build/contracts/Everest.json')
const reserveBankBuild = require('../build/contracts/ReserveBank.json')
const everestABI = require('../abis/Everest.json').abi
const daiABI = require('../abis/dai.json').abi
const addresses = require('../addresses.json')
const params = require('../conf/config.js').everestParams

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

let { network, gasPrice } = parseArgs(process.argv.slice(2), {
    string: ['network', 'gasPrice']
})

if (!network || !gasPrice) {
    console.error(`
    Usage: ${path.basename(process.argv[1])}
        --network        <string> - options: ropsten, mainnet
        --gasPrice       <number> - in gwei (i.e. 5 = 5 gwei)
    `)
    process.exit(1)
}

const overrides = {
    gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei')
}

// Deploy a new Reserve Bank, owned by the new OWNER
const deployNewReserveBank = async (signer, daiAddress) => {
    try {
        const reserveBankContract = new ethers.ContractFactory.fromSolidity(
            reserveBankBuild,
            signer
        )

        console.log(`Deploying a new reserve bank....`)
        const pendingReserveBank = await reserveBankContract.deploy(daiAddress)
        console.log(
            `  ..pending: https://ropsten.etherscan.io/tx/${pendingReserveBank.deployTransaction.hash}`
        )
        console.log('    New reserve bank: ', pendingReserveBank.address)

        const reserveBank = await pendingReserveBank.deployed()
        console.log(
            `    success: https://ropsten.etherscan.io/tx/${reserveBank.deployTransaction.hash}`
        )
        return reserveBank
    } catch (e) {
        console.log(`  ..failed in deployNewReserveBank: ${e.message}`)
        process.exit(1)
    }
}

// Deploy a new Everest, owned by the new OWNER
const deployNewEverest = async (signer, daiAddress, newReserveBankAddress, registryAddress) => {
    try {
        let didRegistryAddress = addresses.mainnet.ethereumDIDRegistry // same addr for ropsten
        const everestContract = new ethers.ContractFactory.fromSolidity(everestBuild, signer)

        console.log(`Deploying a new everest....`)
        const pendingEverest = await everestContract.deploy(
            daiAddress,
            params.votingPeriodDuration,
            params.challengeDeposit,
            params.applicationFee,
            params.charter,
            params.categories,
            didRegistryAddress,
            newReserveBankAddress,
            registryAddress
        )
        console.log(
            `  ..pending: https://ropsten.etherscan.io/tx/${pendingEverest.deployTransaction.hash}`
        )
        console.log('   New everest: ', pendingEverest.address)

        const everest = await pendingEverest.deployed()
        console.log(
            `    success: https://ropsten.etherscan.io/tx/${everest.deployTransaction.hash}`
        )
        return everest
    } catch (e) {
        console.log(`  ..failed in deployNewEverest: ${e.message}`)
        process.exit(1)
    }
}

// Change the new Reserve Bank to be owned by the new Everest.
const changeReserveBankOwner = async (newReserveBank, newEverestAddress) => {
    try {
        console.log(`Changing the new reserve bank owner to the new everest....`)
        const tx = await newReserveBank.transferOwnership(newEverestAddress, overrides)
        console.log(`  ..pending: https://ropsten.etherscan.io/tx/${tx.deployTransaction.hash}`)
        const res = await tx.wait()
        console.log(`    success: https://ropsten.etherscan.io/tx/${res.deployTransaction.hash}`)
        console.log(`    new everest now owns new reserve bank`)
    } catch (e) {
        console.log(`  ..failed in deployNewEverest: ${e.message}`)
        process.exit(1)
    }
}

// Change the ownership of the Registry to be the new Everest.
const changeRegistryOwner = async (oldEverest, newEverestAddress) => {
    try {
        console.log(`Changing the registry owner to the new everest....`)
        const tx = await oldEverest.transferOwnershipRegistry(newEverestAddress, overrides)
        console.log(`  ..pending: https://ropsten.etherscan.io/tx/${tx.deployTransaction.hash}`)
        const res = await tx.wait()
        console.log(`    success: https://ropsten.etherscan.io/tx/${res.deployTransaction.hash}`)
        console.log(`    new everest now owns the registry`)
    } catch (e) {
        console.log(`  ..failed in deployNewEverest: ${e.message}`)
        process.exit(1)
    }
}

// Withdraw the funds from the old Everest, and send them to the new Everest.
const withdrawReserveBank = async (oldEverest, newReserveBankAddress) => {
    try {
        const dai = new ethers.Contract(everestAddress, abi, provider)
        const withdrawAmount = await dai.balanceOf(reserveBankAddress)
        console.log(
            `Withdrawing ${withdrawAmount.toString()} from the old reserve bank to the new reserve bank....`
        )
        const tx = await oldEverest.withdraw(newReserveBankAddress, withdrawAmount, overrides)
        console.log(`  ..pending: https://ropsten.etherscan.io/tx/${tx.deployTransaction.hash}`)
        const res = await tx.wait()
        console.log(`    success: https://ropsten.etherscan.io/tx/${res.deployTransaction.hash}`)
        console.log(`    new reserve bank now has all the funds`)
    } catch (e) {
        console.log(`  ..failed in deployNewEverest: ${e.message}`)
        process.exit(1)
    }
}

const main = async () => {
    try {
        let providerEndpoint
        let everestAddress
        let daiAddress
        let reserveBankAddress
        let registryAddress
        if (network == 'mainnet') {
            providerEndpoint = mainnnetProvider
            everestAddress = addresses.mainnet.everest
            daiAddress = addresses.mainnet.dai
            reserveBankAddress = addresses.mainnet.reserveBank
            registryAddress = addresses.mainnet.registry
        } else if (network == 'ropsten') {
            providerEndpoint = ropstenProvider
            everestAddress = addresses.ropsten.everest
            daiAddress = addresses.ropsten.dai
            reserveBankAddress = addresses.ropsten.reserveBank
            registryAddress = addresses.ropsten.registry
        } else {
            console.error(`ERROR: Please provide the correct network name`)
            process.exit(1)
        }

        const provider = new ethers.providers.JsonRpcProvider(providerEndpoint)
        const connectedWallet = new ethers.Wallet(wallet.signingKey.privateKey, provider)
        const oldEverest = new ethers.Contract(everestAddress, everestABI, provider)
        const oldEverestWithSigner = oldEverest.connect(connectedWallet)

        const dai = new ethers.Contract(daiAddress, daiABI, provider)

        const newReserveBank = await deployNewReserveBank(connectedWallet, daiAddress)
        const newEverest = await deployNewEverest(
            connectedWallet,
            daiAddress,
            newReserveBank.address,
            registryAddress
        )
        await changeReserveBankOwner(oldEverestWithSigner, newEverest.address)
        await changeRegistryOwner(oldEverestWithSigner, newEverest.address)
        await withdrawReserveBank(
            oldEverestWithSigner,
            newReserveBank.address,
            dai,
            reserveBankAddress
        )
    } catch (e) {
        console.log(`  ..failed in main: ${e.message}`)
        process.exit(1)
    }
}

main()
