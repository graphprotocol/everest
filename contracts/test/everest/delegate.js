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

    const fakeDetails = '0x5555555555555555555555555555555555555555555555555555555555554444'

    const delegateType = '0x6576657265737400000000000000000000000000000000000000000000000000'

    // Arbitrarily set to a high value, as Everest does not use Delegate Validity
    const delegateValidity = '0x00000000000000000000000000000000000000000000000000ffffffffffffff'

    let everest
    let edr
    before(async () => {
        everest = await Everest.deployed()
        edr = await EthereumDIDRegistry.deployed()
    })

    describe('Delegates - Testing delegate voting', () => {
        before(async () => {
            await helpers.applySignedWithAttributeAndPermit(member1Wallet, owner1Wallet, everest)
            await helpers.applySignedWithAttributeAndPermit(member2Wallet, owner2Wallet, everest)
            await helpers.applySignedWithAttributeAndPermit(member3Wallet, owner3Wallet, everest)
            await helpers.applySignedWithAttributeAndPermit(member4Wallet, owner4Wallet, everest)
        })
        it('Allows a delegate to vote for the owner', async () => {
            await edr.addDelegate(member2Address, delegateType, owner5Address, delegateValidity, {
                from: owner2Address
            })

            // Check delegate was added successfully
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
                owner1Address,
                everest
            )

            // Vote with delegate account
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
