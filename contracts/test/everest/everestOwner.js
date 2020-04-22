const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const ReserveBank = artifacts.require('ReserveBank.sol')

const Token = artifacts.require('Dai.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('Everest', () => {
    const newMemberWallet = utils.wallets.nine() // throw away wallet
    const ownerWallet = utils.wallets.one()
    const registryOwnerWallet = utils.wallets.zero()
    const registryOwnerAddress = registryOwnerWallet.signingKey.address

    const newOwnerWallet = utils.wallets.six()
    const newOwnerAddress = newOwnerWallet.signingKey.address

    const member3Wallet = utils.wallets.seven() // throw away wallet
    const member3Address = member3Wallet.signingKey.address
    const owner3Wallet = utils.wallets.two()
    const owner3Address = owner3Wallet.signingKey.address

    const member5Wallet = utils.wallets.five() // throw away wallet
    const member5Address = member5Wallet.signingKey.address
    const owner5Wallet = utils.wallets.four()
    const owner5Address = owner5Wallet.signingKey.address

    const fakeDetails = '0x5555555555555555555555555555555555555555555555555555555555554444'

    let everest
    let token
    before(async () => {
        everest = await Everest.deployed()
        token = await Token.deployed()
        registry = await Registry.deployed()
        reserveBank = await ReserveBank.deployed()

        await helpers.applySignedWithAttributeAndPermit(newMemberWallet, ownerWallet, everest)
        await helpers.applySignedWithAttributeAndPermit(member3Wallet, owner3Wallet, everest)
        await helpers.applySignedWithAttributeAndPermit(member5Wallet, owner5Wallet, everest)
    })

    describe('Everest owner functionality. Functions: withdraw(), updateCharter()', () => {
        it('should allow owner to update the charter', async () => {
            const newCharter = '0x0123456789012345678901234567890123456789012345678901234567891111'
            await everest.updateCharter(newCharter, { from: registryOwnerAddress })
            const updatedCharter = await everest.charter()
            assert.equal(updatedCharter, newCharter, 'Charter was not updated')
        })

        it('should allow owner to update the categories', async () => {
            const newCategories =
                '0x0123456789012345678901234567890123456789012345678901234567891111'
            await everest.updateCategories(newCategories, { from: registryOwnerAddress })
            const updatedCategories = await everest.categories()
            assert.equal(updatedCategories, newCategories, 'Categories was not updated')
        })

        it('should allow owner to withdraw DAI from reserve bank', async () => {
            const reserveBankAddress = await everest.reserveBank()

            const bankOwnerBalanceStart = await token.balanceOf(registryOwnerAddress)
            const reserveBankBalanceStart = await token.balanceOf(reserveBankAddress)

            await everest.withdraw(registryOwnerAddress, utils.applyFeeBN, {
                from: registryOwnerAddress
            })

            const bankOwnerBalanceEnd = await token.balanceOf(registryOwnerAddress)
            const reserveBankBalanceEnd = await token.balanceOf(reserveBankAddress)

            assert.equal(
                bankOwnerBalanceEnd.toString(),
                bankOwnerBalanceStart.add(utils.applyFeeBN).toString(),
                'Owner did not withdraw application fee'
            )
            assert.equal(
                reserveBankBalanceEnd.toString(),
                reserveBankBalanceStart.sub(utils.applyFeeBN).toString(),
                'Reserve bank did not withdraw funds'
            )
        })

        it('should allow owner to update the voting period duration', async () => {
            await everest.updateVotingPeriodDuration(86400, { from: registryOwnerAddress })
            const newDuration = await everest.votingPeriodDuration()
            assert.equal(newDuration, 86400, 'Voting period duration was not updated')
        })

        it('should allow owner to update the challenge deposit', async () => {
            await everest.updateChallengeDeposit('20000000000000000000', {
                from: registryOwnerAddress
            })
            const newDeposit = await everest.challengeDeposit()
            assert.equal(newDeposit, '20000000000000000000', 'Challenge deposit was not updated')

            // change back
            await everest.updateChallengeDeposit('10000000000000000000', {
                from: registryOwnerAddress
            })
            const oldDeposit = await everest.challengeDeposit()
            assert.equal(oldDeposit, '10000000000000000000', 'Challenge deposit was not reverted')
        })

        it('should allow owner to update the application fee', async () => {
            await everest.updateApplicationFee('20000000000000000000', {
                from: registryOwnerAddress
            })
            const newFee = await everest.applicationFee()
            assert.equal(newFee, '20000000000000000000', 'Application fee was not updated')
        })

        it('should allow owner to freeze challenges and prevent them from being made', async () => {
            const isNotFrozen = await everest.challengesFrozen()
            assert.equal(isNotFrozen, false, 'Challenges did not start off frozen')
            await everest.updateChallengeFreeze(true)
            const isFrozen = await everest.challengesFrozen()
            assert.equal(isFrozen, true, 'Challenges did not change to frozen')

            await utils.expectRevert(
                everest.challenge(member3Address, member5Address, fakeDetails, {
                    from: owner3Address
                }),
                'challenge - Cannot create challenge, frozen'
            )
        })

        it('should allow owner to un-freeze challenges and allow them to be made', async () => {
            await everest.updateChallengeFreeze(false)
            const isNotFrozen = await everest.challengesFrozen()
            assert.equal(isNotFrozen, false, 'Challenges did not change back to frozen')

            const challengeIDBefore = await everest.challengeCounter()
            const challengeID = await helpers.challenge(
                member3Address,
                member5Address,
                fakeDetails,
                owner3Address,
                everest
            )
            assert.equal(challengeID, challengeIDBefore, 'ChallengeID was not created properly')
        })

        it('should allow owner the transfer of ReserveBank', async () => {
            await everest.transferOwnershipReserveBank(newOwnerAddress, {
                from: registryOwnerAddress
            })
            const newOwner = await reserveBank.owner()
            assert.equal(newOwnerAddress, newOwner, 'ReserveBank ownership was not transferred')
        })

        it('should allow owner the transfer of Registry', async () => {
            await everest.transferOwnershipRegistry(newOwnerAddress, { from: registryOwnerAddress })
            const newOwner = await registry.owner()
            assert.equal(newOwnerAddress, newOwner, 'Registry ownership was not transferred')
        })
    })
})
