// This test goes end to end with testing the upgrading of contracts for everest
const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const ReserveBank = artifacts.require('ReserveBank.sol')
const Dai = artifacts.require('dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')

const helpers = require('../helpers.js')
const utils = require('../utils.js')
const config = require('../../conf/config.js')
const params = config.everestParams
const originalOwner = config.ganacheParams.owner

contract('Upgrading Contracts', () => {
    const newEverestOwnerWallet = utils.wallets.five()
    const newEverestOwnerAddress = newEverestOwnerWallet.signingKey.address

    const member1Wallet = utils.wallets.nine() // throw away wallet
    const member1Address = member1Wallet.signingKey.address
    const owner1Wallet = utils.wallets.zero()
    const owner1Address = owner1Wallet.signingKey.address

    const member2Wallet = utils.wallets.eight() // throw away wallet
    const member2Address = member2Wallet.signingKey.address
    const owner2Wallet = utils.wallets.one()
    const owner2Address = owner2Wallet.signingKey.address

    const member3Wallet = utils.wallets.seven() // throw away wallet
    const member3Address = member3Wallet.signingKey.address
    const owner3Wallet = utils.wallets.two()
    const owner3Address = owner3Wallet.signingKey.address

    const member4Wallet = utils.wallets.six() // throw away wallet
    const member4Address = member4Wallet.signingKey.address
    const owner4Wallet = utils.wallets.three()
    const owner4Address = owner4Wallet.signingKey.address

    const member5Wallet = utils.wallets.five() // throw away wallet
    const member5Address = member5Wallet.signingKey.address
    const owner5Wallet = utils.wallets.four()
    const owner5Address = owner5Wallet.signingKey.address

    let newEverest
    let newReserveBank
    let dai
    let DIDregistry
    let registry
    before(async () => {
        dai = await Dai.deployed()
        DIDregistry = await EthereumDIDRegistry.deployed()
        registry = await Registry.deployed()
        reserveBank = await ReserveBank.deployed()
        everest = await Everest.deployed()
    })

    describe('Upgrading contracts', () => {
        it('should register one member so reserve bank has a balance to transfer later', async () => {
            await helpers.applySignedWithAttributeAndPermit(member1Wallet, owner1Wallet, everest)
        })
        it('should deploy a new Reserve Bank', async () => {
            newReserveBank = await ReserveBank.new(dai.address, { from: newEverestOwnerAddress })
            assert.equal(typeof newReserveBank.address, 'string', 'New reserve bank did not deploy')
        })
        it('should deploy a new Everest', async () => {
            const oldChallengeID = await everest.challengeCounter()
            newEverest = await Everest.new(
                dai.address,
                params.votingPeriodDuration,
                params.challengeDeposit,
                params.applicationFee,
                params.charter,
                params.categories,
                DIDregistry.address,
                newReserveBank.address,
                registry.address,
                oldChallengeID + 1,
                { from: newEverestOwnerAddress }
            )
            assert.equal(typeof newEverest.address, 'string', 'New everest did not deploy')
        })
        it('should transfer ownership of the new reserve bank to the new everest', async () => {
            await newReserveBank.transferOwnership(newEverest.address, {
                from: newEverestOwnerAddress
            })
            const reserveBankOwner = await newReserveBank.owner()
            assert.equal(
                reserveBankOwner,
                newEverest.address,
                'New everest failed to own new reserve bank'
            )
        })

        it('should transfer ownership of the registry to the new everest', async () => {
            await everest.transferOwnershipRegistry(newEverest.address, { from: originalOwner })
            const registryOwner = await registry.owner()
            assert.equal(
                registryOwner,
                newEverest.address,
                'New everest failed to own the registry'
            )
        })

        it('should transfer funds from old reserve bank to new reserve bank', async () => {
            const oldBankBalance = await dai.balanceOf(reserveBank.address)
            await everest.withdraw(newReserveBank.address, oldBankBalance, { from: originalOwner })
            const updatedBankBalance = await dai.balanceOf(reserveBank.address)
            const newBankBalance = await dai.balanceOf(newReserveBank.address)

            assert.equal(
                updatedBankBalance.toString(),
                '0',
                'Old bank did not withdraw its reserves'
            )
            assert.equal(
                newBankBalance.toString(),
                oldBankBalance.toString(),
                'New Reserve bank did not receive funds'
            )
        })

        it('new everest should allow new members to join', async () => {
            await helpers.applySignedWithAttributeAndPermit(member2Wallet, owner2Wallet, newEverest)
            await helpers.applySignedWithAttributeAndPermit(member3Wallet, owner3Wallet, newEverest)
            await helpers.applySignedWithAttributeAndPermit(member4Wallet, owner4Wallet, newEverest)
            await helpers.applySignedWithAttributeAndPermit(member5Wallet, owner5Wallet, newEverest)
        })

        it('new everest should allow a member to be challenged, win, and stay', async () => {
            const fakeDetails = '0x5555555555555555555555555555555555555555555555555555555555554444'
            const voteChoice = {
                Null: 0,
                Yes: 1,
                No: 2
            }

            // Check member exists
            assert(await everest.isMember(member4Address), 'Member was not added')

            const challengeID = await helpers.challenge(
                member2Address,
                member4Address,
                fakeDetails,
                owner2Address,
                newEverest
            )

            await newEverest.submitVote(challengeID, voteChoice.No, member5Address, {
                from: owner5Address
            })
            await newEverest.submitVote(challengeID, voteChoice.No, member3Address, {
                from: owner3Address
            })

            await helpers.resolveChallenge(challengeID, owner1Address, owner4Address, newEverest)

            // Check member still exists
            assert(
                await everest.isMember(member4Address),
                'Member was removed, when they shouldnt have been'
            )

            // Check challenge was removed
            assert(
                !(await everest.memberChallengeExists(member4Address)),
                'Challenge was removed as expected'
            )
        })

        it('new everest owner should be able to withdraw', async () => {
            const withdrawAmount = utils.challengeRewardBN // equal to 1 dai usually
            const bankOwnerBalanceStart = await dai.balanceOf(newEverestOwnerAddress)
            const reserveBankBalanceStart = await dai.balanceOf(newReserveBank.address)

            await newEverest.withdraw(newEverestOwnerAddress, withdrawAmount, {
                from: newEverestOwnerAddress
            })

            const bankOwnerBalanceEnd = await dai.balanceOf(newEverestOwnerAddress)
            const reserveBankBalanceEnd = await dai.balanceOf(newReserveBank.address)

            assert.equal(
                bankOwnerBalanceEnd.toString(),
                bankOwnerBalanceStart.add(withdrawAmount).toString(),
                'Owner did not withdraw'
            )
            assert.equal(
                reserveBankBalanceEnd.toString(),
                reserveBankBalanceStart.sub(withdrawAmount).toString(),
                'Reserve bank did not release funds'
            )
        })
        it('new everest owner can update categories', async () => {
            const newCategories =
                '0x0123456789012345678901234567890123456789012345678901234567891111'
            await newEverest.updateCategories(newCategories, {
                from: newEverestOwnerAddress
            })
            const updatedCategories = await newEverest.categories()
            assert.equal(updatedCategories, newCategories, 'Categories was not updated')
        })
    })
})
