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
 *
 * // NOTE - this script only really works one way, afterwords you have to edit it to work,
 *           since the addresses change
 */

const fs = require('fs')
const ethers = require('ethers')
const parseArgs = require('minimist')
const path = require('path')

const everestBuild = require('../build/contracts/Everest.json')
const reserveBankBuild = require('../build/contracts/ReserveBank.json')
const oldEverestABI = require('../../subgraph/old_abis/Everest_old.json').abi
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
const masterAddress = '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd' // The owner of all contracts

const { network, gasPrice, func } = parseArgs(process.argv.slice(2), {
    string: ['network', 'gasPrice', 'func']
})

if (!network || !gasPrice || !func) {
    console.error(`
    Usage: ${path.basename(process.argv[1])}
        --network               <string> - options: ropsten, mainnet
        --gasPrice              <number> - in gwei (i.e. 5 = 5 gwei)
        --func                  <string> - options: withdraw, upgrade, deposit
    `)
    process.exit(1)
}

const overrides = {
    gasPrice: ethers.utils.parseUnits(gasPrice, 'gwei')
}

// Withdraw the funds from the old Everest, and send them to a non-contract account.
// The step is done first to ensure funds are safu
const withdrawReserveBank = async (
    oldEverestWithSigner,
    dai,
    oldReserveBankAddress,
    networkString
) => {
    try {
        if (oldEverestWithSigner.signer.signingKey.address != masterAddress) {
            throw new Error('Wrong signing address for withdrawal')
        }
        const withdrawAmount = await dai.balanceOf(oldReserveBankAddress)
        console.log(
            `Withdrawing ${withdrawAmount.toString()} DAI from the old reserve bank to graph owned user account....`
        )
        const tx = await oldEverestWithSigner.withdraw(masterAddress, withdrawAmount, overrides)
        console.log(`    ..pending: https://${networkString}etherscan.io/tx/${tx.hash}`)
        const res = await tx.wait()
        console.log(`    success: https://${networkString}etherscan.io/tx/${res.transactionHash}`)
        console.log(`    funds are now in the graphs external account`)
    } catch (e) {
        console.log(`    ..failed in withdrawReserveBank: ${e.message}`)
        process.exit(1)
    }
}

// Deploy a new Reserve Bank, owned by the new OWNER
const deployNewReserveBank = async (connectedWallet, daiAddress, networkString) => {
    try {
        if (connectedWallet.signingKey.address != masterAddress) {
            throw new Error('Wrong signing address for deploying new reserve bank')
        }
        const reserveBankContract = new ethers.ContractFactory.fromSolidity(
            reserveBankBuild,
            connectedWallet
        )

        console.log(`Deploying a new reserve bank....`)
        const pendingReserveBank = await reserveBankContract.deploy(daiAddress)
        console.log(
            `    ..pending: https://${networkString}etherscan.io/tx/${pendingReserveBank.deployTransaction.hash}`
        )
        console.log('    New reserve bank: ', pendingReserveBank.address)

        const reserveBank = await pendingReserveBank.deployed()
        console.log(
            `    success: https://${networkString}etherscan.io/tx/${reserveBank.deployTransaction.hash}`
        )
        return reserveBank
    } catch (e) {
        console.log(`    ..failed in deployNewReserveBank: ${e.message}`)
        process.exit(1)
    }
}

// Deploy a new Everest, owned by the new OWNER
const deployNewEverest = async (
    connectedWallet,
    daiAddress,
    registryAddress,
    oldEverest,
    newReserveBankAddress,
    networkString
) => {
    try {
        if (connectedWallet.signingKey.address != masterAddress) {
            throw new Error('Wrong signing address for deploying new everest')
        }

        let didRegistryAddress = addresses.mainnet.ethereumDIDRegistry // same addr for ropsten
        const newEverestContract = new ethers.ContractFactory.fromSolidity(
            everestBuild,
            connectedWallet
        )
        const startingChallengeID = await oldEverest.challengeCounter()

        console.log(`Deploying a new everest....`)
        console.log(`   starting challenge ID: ${startingChallengeID}`)
        const pendingEverest = await newEverestContract.deploy(
            daiAddress,
            params.votingPeriodDuration,
            params.challengeDeposit,
            params.applicationFee,
            params.charter,
            params.categories,
            didRegistryAddress,
            newReserveBankAddress,
            registryAddress,
            startingChallengeID
        )
        console.log(
            `    ..pending: https://${networkString}etherscan.io/tx/${pendingEverest.deployTransaction.hash}`
        )
        console.log('   New everest: ', pendingEverest.address)

        const everest = await pendingEverest.deployed()
        console.log(
            `    success: https://${networkString}etherscan.io/tx/${everest.deployTransaction.hash}`
        )
        return everest
    } catch (e) {
        console.log(`    ..failed in deployNewEverest: ${e.message}`)
        process.exit(1)
    }
}

// Change the new Reserve Bank to be owned by the new Everest.
// IMPORTANT - ensure the newReserveBankAddress is correct. You must transfer only this address
//             to the new everest. Accidentally passing the old everest would break it
const changeReserveBankOwner = async (
    newReserveBank,
    newReserveBankAddress,
    newEverestAddress,
    networkString
) => {
    try {
        // Sanity check to make sure we are passing the right object
        if (newReserveBank.address != newReserveBankAddress) {
            throw new Error('You may have passed the wrong contract object')
        }
        console.log(`Changing the new reserve bank owner to the new everest....`)
        const tx = await newReserveBank.transferOwnership(newEverestAddress, overrides)
        console.log(`    ..pending: https://${networkString}etherscan.io/tx/${tx.hash}`)
        const res = await tx.wait()
        console.log(`    success: https://${networkString}etherscan.io/tx/${res.transactionHash}`)
        console.log(`    new everest now owns new reserve bank`)
    } catch (e) {
        console.log(`    ..failed in changeReserveBankOwner: ${e.message}`)
        process.exit(1)
    }
}

// Change the ownership of the Registry to be the new Everest.
const changeRegistryOwner = async (oldEverest, newEverest, networkString) => {
    try {
        if (oldEverest.signer.signingKey.address != masterAddress) {
            throw new Error('Wrong signing address for withdrawal')
        }
        // Testing to ensure we have the right contract object
        const testCategories = await newEverest.categories()
        if (typeof testCategories != 'string') {
            throw new Error(`You are accessing the wrong contract`)
        }
        const testOwner = await newEverest.owner()
        if (testOwner != masterAddress) {
            throw new Error(
                `You are accessing the wrong contract, it isn't owned by the right account`
            )
        }

        console.log(`Changing the registry owner to the new everest....`)
        const tx = await oldEverest.transferOwnershipRegistry(newEverest.address, overrides)
        console.log(`    ..pending: https://${networkString}etherscan.io/tx/${tx.hash}`)
        const res = await tx.wait()
        console.log(`    success: https://${networkString}etherscan.io/tx/${res.transactionHash}`)
        console.log(`    new everest now owns the registry`)
    } catch (e) {
        console.log(`    ..failed in changeRegistryOwner: ${e.message}`)
        process.exit(1)
    }
}

// Withdraw the funds from the old Everest, and send them to the new Everest.
const depositReserveBank = async (
    connectedWallet,
    newEverest,
    newReserveBankAddress,
    dai,
    networkString
) => {
    try {
        const daiWithSigner = dai.connect(connectedWallet)
        let amount = ethers.utils.parseEther('1.0') // Same decimals as DAI

        console.log(`Depositing ${amount} DAI from external account to reserve bank`)
        const sendTx = await daiWithSigner.transfer(newReserveBankAddress, amount)
        console.log(`    ..pending: https://${networkString}etherscan.io/tx/${sendTx.hash}`)
        const sendRes = await sendTx.wait()
        console.log(
            `    success: https://${networkString}etherscan.io/tx/${sendRes.transactionHash}`
        )
        console.log(`    deposited 1 DAI into the reserveBank`)

        const withdrawTx = await newEverest.withdraw(masterAddress, amount, overrides)
        console.log(`    ..pending: https://${networkString}etherscan.io/tx/${withdrawTx.hash}`)
        const withdrawRes = await withdrawTx.wait()
        console.log(
            `    success: https://${networkString}etherscan.io/tx/${withdrawRes.transactionHash}`
        )
        console.log(`    withdrew 1 DAI from the reserveBank`)
    } catch (e) {
        console.log(`    ..failed in withdrawReserveBank: ${e.message}`)
        process.exit(1)
    }
}

const depositToEverest = async (connectedWallet, dai, networkString) => {
    try {
        const daiWithSigner = dai.connect(connectedWallet)
        let amount = ethers.utils.parseEther('409.0') // Same decimals as DAI

        console.log(`Depositing ${amount} DAI from external account to reserve bank`)
        const sendTx = await daiWithSigner.transfer(addresses.mainnet.reserveBank, amount)
        console.log(`    ..pending: https://${networkString}etherscan.io/tx/${sendTx.hash}`)
        const sendRes = await sendTx.wait()
        console.log(
            `    success: https://${networkString}etherscan.io/tx/${sendRes.transactionHash}`
        )
        console.log(`    deposited 409 DAI into the reserveBank`)
    } catch (e) {
        console.log(`    ..failed in withdrawReserveBank: ${e.message}`)
        process.exit(1)
    }
}

const main = async () => {
    try {
        let providerEndpoint
        let oldEverestAddress
        let daiAddress
        let oldReserveBankAddress
        let registryAddress
        if (network == 'mainnet') {
            providerEndpoint = mainnnetProvider
            oldEverestAddress = addresses.mainnet.oldEverest
            daiAddress = addresses.mainnet.dai
            oldReserveBankAddress = addresses.mainnet.oldReserveBank
            registryAddress = addresses.mainnet.registry
        } else if (network == 'ropsten') {
            providerEndpoint = ropstenProvider
            oldEverestAddress = addresses.ropsten.oldEverest
            daiAddress = addresses.ropsten.dai
            oldReserveBankAddress = addresses.ropsten.oldReserveBank
            registryAddress = addresses.ropsten.registry
        } else {
            console.error(`ERROR: Please provide the correct network name`)
            process.exit(1)
        }

        const provider = new ethers.providers.JsonRpcProvider(providerEndpoint)
        const connectedWallet = new ethers.Wallet(wallet.signingKey.privateKey, provider)
        const oldEverest = new ethers.Contract(oldEverestAddress, oldEverestABI, provider)
        const oldEverestWithSigner = oldEverest.connect(connectedWallet)
        const dai = new ethers.Contract(daiAddress, daiABI, provider)
        const networkString = network == 'ropsten' ? 'ropsten.' : ''

        if (func == 'withdraw') {
            await withdrawReserveBank(
                oldEverestWithSigner,
                dai,
                oldReserveBankAddress,
                networkString
            )
        } else if (func == 'deposit') {
            await depositToEverest(connectedWallet, dai, networkString)
        } else if (func == 'upgrade') {
            const newReserveBank = await deployNewReserveBank(
                connectedWallet,
                daiAddress,
                networkString
            )
            const newEverest = await deployNewEverest(
                connectedWallet,
                daiAddress,
                registryAddress,
                oldEverest,
                newReserveBank.address,
                networkString
            )
            await changeReserveBankOwner(
                newReserveBank,
                newReserveBank.address,
                newEverest.address,
                networkString
            )
            // Past here, we can't turn back
            await changeRegistryOwner(oldEverestWithSigner, newEverest, networkString)
            await depositReserveBank(
                connectedWallet,
                newEverest,
                newReserveBank.address,
                dai,
                networkString
            )
            console.log('DONE! MAKE SURE TO UPDATE THE CONTRACT ADDRESSES IN addresses.json')
        } else {
            console.log(`You did not pass the write func name`)
            process.exit(1)
        }
    } catch (e) {
        console.log(`    ..failed in main: ${e.message}`)
        process.exit(1)
    }
}

main()
