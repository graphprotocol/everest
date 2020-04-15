const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('Everest', () => {
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

    const nonMemberWallet = utils.wallets.ten()
    const nonMemberAddress = nonMemberWallet.signingKey.address

    const voteChoice = {
        Null: 0,
        Yes: 1,
        No: 2
    }
    const fakeDetails = '0x5555555555555555555555555555555555555555555555555555555555554444'

    let everest
    before(async () => {
        everest = await Everest.deployed()
        registry = await Registry.deployed()
    })

    describe('Test voting require statements and functionality', () => {
        // Set up 5 Tokens
        before(async () => {
            await helpers.applySignedWithAttributeAndPermit(member1Wallet, owner1Wallet, everest)
            await helpers.applySignedWithAttributeAndPermit(member2Wallet, owner2Wallet, everest)
            await helpers.applySignedWithAttributeAndPermit(member3Wallet, owner3Wallet, everest)
            await helpers.applySignedWithAttributeAndPermit(member4Wallet, owner4Wallet, everest)
            await helpers.applySignedWithAttributeAndPermit(member5Wallet, owner5Wallet, everest)
        })
        it('Voting on a challenge that does not exist fails', async () => {
            const fakeChallengeID = 500
            await utils.expectRevert(
                everest.submitVote(fakeChallengeID, voteChoice.Yes, member1Address, {
                    from: owner1Address
                }),
                `submitVote - Challenge does not exist`
            )
        })
        it('Voting must be yes or no, any other choice fails', async () => {
            const challengeID = await helpers.challenge(
                member1Address,
                member5Address,
                fakeDetails,
                owner1Address,
                everest
            )

            await utils.expectRevert(
                everest.submitVote(challengeID, 0, member1Address, {
                    from: owner1Address
                }),
                `submitVote - Vote must be either Yes or No`
            )

            // For access outside of an enum, the error is invalid opcode
            await utils.expectRevert(
                everest.submitVote(challengeID, 3, member1Address, {
                    from: owner1Address
                }),
                `invalid opcode`
            )
        })

        it('Vote weight is calculated as sqrt(challengeEndTime - memberStartTime)', async () => {
            const challengeID = await registry.getChallengeID(member5Address)

            const tx = await everest.submitVote(challengeID, 1, member2Address, {
                from: owner2Address
            })

            const eventVoteWeight = Number(tx.logs[0].args.voteWeight.toString())
            const challenge = await everest.challenges(challengeID)
            const challengeEndTime = Number(challenge.endTime.toString())

            const member = await registry.members(member2Address)
            const memberStartTime = Number(member.memberStartTime.toString())

            const difference = challengeEndTime - memberStartTime
            const voteWeight = Math.floor(Math.sqrt(difference))

            assert.equal(voteWeight, eventVoteWeight, 'Square root was not calculated properly')
        })

        it('Double voting on a challenge fails.', async () => {
            const challengeID = await registry.getChallengeID(member5Address)
            await utils.expectRevert(
                everest.submitVote(challengeID, 1, member2Address, {
                    from: owner2Address
                }),
                `submitVote - Member has already voted on this challenge`
            )
        })

        it('Voting by a non-member fails', async () => {
            const challengeID = await registry.getChallengeID(member5Address)
            await utils.expectRevert(
                everest.submitVote(challengeID, 1, nonMemberAddress, {
                    from: nonMemberAddress
                }),
                `Address is not a Member`
            )
        })
        it('Voting on an expired challenge fails', async () => {
            const challengeID = await registry.getChallengeID(member5Address)

            // Increase time, but do not resolve challenge yet
            await utils.increaseTime(utils.votePeriod + 1)
            await utils.expectRevert(
                everest.submitVote(challengeID, 1, member3Address, {
                    from: owner3Address
                }),
                `submitVote - Challenge voting period has expired`
            )
        })
    })
})
