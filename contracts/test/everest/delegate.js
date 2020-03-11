const Everest = artifacts.require('Everest.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')

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

    const delegateType = '0x6576657265737400000000000000000000000000000000000000000000000000'

    // TODO - fix this, it isnt 100 years
    const oneHundredYearsValidity =
        '0x00000000000000000000000000000000000000000000000000ffffffffffffff'

    let everest
    let edr
    before(async () => {
        everest = await Everest.deployed()
        edr = await EthereumDIDRegistry.deployed()
    })

    describe('Test voting require statements and functionality', () => {
        before(async () => {
            await helpers.applySignedWithAttribute(member1Wallet, owner1Wallet)
            await helpers.applySignedWithAttribute(member2Wallet, owner2Wallet)
            await helpers.applySignedWithAttribute(member3Wallet, owner3Wallet)
            await helpers.applySignedWithAttribute(member4Wallet, owner4Wallet)
        })
        it('Allows a delegate to vote for the owner', async () => {
            await edr.addDelegate(
                member2Address,
                delegateType,
                owner5Address,
                oneHundredYearsValidity,
                { from: owner2Address }
            )

            const validDelegate = await edr.validDelegate(
                member2Address,
                delegateType,
                owner5Address
            )
            assert(validDelegate, 'Delegate is not valid when it should be')

            const challengeID = await helpers.challenge(
                member1Address,
                member4Address,
                fakeDetails,
                owner1Address
            )

            const tx = await everest.submitVote(challengeID, 1, member2Address, {
                from: owner5Address
            })

            assert.equal(tx.logs[0].args.submitter, owner5Address, 'Delegate did not submit vote')
            assert.equal(
                tx.logs[0].args.votingMember,
                member2Address,
                'Member was not used for vote'
            )
        })
    })
})
