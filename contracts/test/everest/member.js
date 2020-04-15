const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('Everest', () => {
    const newMemberWallet = utils.wallets.nine() // throw away wallet
    const newMemberAddress = newMemberWallet.signingKey.address
    const ownerWallet1 = utils.wallets.one()
    const ownerAddress1 = ownerWallet1.signingKey.address
    const ownerWallet2 = utils.wallets.two()
    const ownerAddress2 = ownerWallet2.signingKey.address

    let everest
    before(async () => {
        everest = await Everest.deployed()
    })

    describe('Member joining and leaving. Functions: applySignedWithAttribute(), memberExit()', () => {
        // Allows a member to permit the Everest to transfer DAI, apply to be on the
        // Everest, and update the token information, while using ERC-1056 for each
        it('Should allow member to join the registry', async () => {
            await helpers.applySignedWithAttributeAndPermit(newMemberWallet, ownerWallet1, everest)
        })

        it('Should prevent a member from double joining', async () => {
            // Should fail when trying to apply again
            await utils.expectRevert(
                helpers.applySignedWithAttributeAndPermit(newMemberWallet, ownerWallet1, everest),
                'applySignedInternal - This member already exists'
            )
        })

        it('Should allow a member to exit', async () => {
            const registry = await Registry.deployed()

            // Get previous member start time
            const membershipStartTime = Number(
                (await registry.getMemberStartTime(newMemberAddress)).toString()
            )
            assert(membershipStartTime > 0, 'Membership start time not updated')

            // Get updated member start time (should be 0)
            await everest.memberExit(newMemberAddress, { from: ownerAddress1 })
            const membershipStartTimeUpdated = Number(
                (await registry.getMemberStartTime(newMemberAddress)).toString()
            )
            assert(membershipStartTimeUpdated == 0, 'Membership start time should be reset to 0')
        })

        it('Should revert if non-owner try to exit a member', async () => {
            await utils.expectRevert(
                everest.memberExit(newMemberAddress, { from: ownerAddress2 }),
                'onlyMemberOwner - Address is not a member -- Reason given: onlyMemberOwner - Address is not a member.'
            )
        })
    })

    describe('Member editing. Functions: setAttribute()', () => {
        it('should allow an updated owner to set attribute', async () => {
            await helpers.setAttribute(newMemberAddress, ownerWallet1)
        })

        it('should disallow a non-owner to set attribute', async () => {
            await utils.expectRevert(
                helpers.setAttribute(newMemberAddress, ownerWallet2),
                'Caller must be the identity owner -- Reason given: Caller must be the identity owner.'
            )
        })
    })
})
