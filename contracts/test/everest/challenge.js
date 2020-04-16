const Everest = artifacts.require('Everest.sol')
const helpers = require('../helpers.js')
const utils = require('../utils.js')

contract('everest', () => {
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
    })

    describe(
        'Test challenges. Functions: challenge(), submitVote(), resolveChallenge(), ' +
            'memberChallengeExists(), isMember()',
        () => {
            // Set up 5 Tokens
            before(async () => {
                await helpers.applySignedWithAttributeAndPermit(
                    member1Wallet,
                    owner1Wallet,
                    everest
                )
                await helpers.applySignedWithAttributeAndPermit(
                    member2Wallet,
                    owner2Wallet,
                    everest
                )
                await helpers.applySignedWithAttributeAndPermit(
                    member3Wallet,
                    owner3Wallet,
                    everest
                )
                await helpers.applySignedWithAttributeAndPermit(
                    member4Wallet,
                    owner4Wallet,
                    everest
                )
                await helpers.applySignedWithAttributeAndPermit(
                    member5Wallet,
                    owner5Wallet,
                    everest
                )
            })

            it(
                'should allow a member to be challenged, lose, and be removed. ' +
                    'Also tests challengee cannot vote on their own challenge',
                async () => {
                    const challengeID = await helpers.challenge(
                        member1Address,
                        member5Address,
                        fakeDetails,
                        owner1Address,
                        everest
                    )

                    await everest.submitVote(challengeID, voteChoice.Yes, member2Address, {
                        from: owner2Address
                    })
                    await everest.submitVote(challengeID, voteChoice.Yes, member3Address, {
                        from: owner3Address
                    })

                    // Expect that challengee can't vote on their own challenge
                    await utils.expectRevert(
                        everest.submitVote(challengeID, voteChoice.Yes, member5Address, {
                            from: owner5Address
                        }),
                        `submitVote - Member can't vote on their own challenge`
                    )

                    await helpers.resolveChallenge(challengeID, owner1Address, owner4Address, everest)

                    // Check member has been removed
                    assert(!(await everest.isMember(member5Address)), 'Member was not removed')

                    // Check challenge was removed
                    assert(
                        !(await everest.memberChallengeExists(member5Address)),
                        'Challenge was removed as expected'
                    )
                }
            )

            it('should allow a member to be challenged, win, and stay', async () => {
                // Check member exists
                assert(await everest.isMember(member4Address), 'Member was not added')

                const challengeID = await helpers.challenge(
                    member1Address,
                    member4Address,
                    fakeDetails,
                    owner1Address,
                    everest
                )

                await everest.submitVote(challengeID, voteChoice.No, member2Address, {
                    from: owner2Address
                })
                await everest.submitVote(challengeID, voteChoice.No, member3Address, {
                    from: owner3Address
                })

                await helpers.resolveChallenge(challengeID, owner1Address, owner5Address, everest)

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

            it('challenge should fail when no one votes except the challenger', async () => {
                // Check member exists
                assert(await everest.isMember(member4Address), 'Member was not added')

                const challengeID = await helpers.challenge(
                    member1Address,
                    member4Address,
                    fakeDetails,
                    owner1Address,
                    everest
                )

                await helpers.resolveChallenge(challengeID, owner1Address, owner5Address, everest)

                // Check member still exists, since only one vote happened
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
            it('challenger cant challenge self. challenger must exist. challengee must exist', async () => {
                // Check member exists
                assert(await everest.isMember(member4Address), 'Member was not added')

                // Expect fail for trying to challenge self
                await utils.expectRevert(
                    everest.challenge(member3Address, member3Address, fakeDetails, {
                        from: owner3Address
                    }),
                    "challenge - Can't challenge self"
                )

                // Expect fail for challenger not existing
                await utils.expectRevert(
                    everest.challenge(nonMemberAddress, member3Address, fakeDetails, {
                        from: nonMemberAddress
                    }),
                    'onlyMemberOwner - Address is not a member'
                )

                // Expect fail for trying to challenge self
                await utils.expectRevert(
                    everest.challenge(member3Address, nonMemberAddress, fakeDetails, {
                        from: owner3Address
                    }),
                    'challenge - Challengee must exist'
                )
            })
            it('challengee cannot have two challenges against them. and challengee cannot exit during ongoing challenge', async () => {
                // Check member exists
                assert(await everest.isMember(member4Address), 'Member was not added')

                await helpers.challenge(
                    member1Address,
                    member4Address,
                    fakeDetails,
                    owner1Address,
                    everest
                )

                // Expect that challengee can't have two challenges against them
                await utils.expectRevert(
                    everest.challenge(member1Address, member4Address, fakeDetails, {
                        from: owner1Address
                    }),
                    'challenge - Existing challenge must be resolved first'
                )

                // Expect member can't exit when challenged
                await utils.expectRevert(
                    everest.memberExit(member4Address, { from: owner4Address }),
                    "memberExit - Can't exit during ongoing challenge"
                )
            })
        }
    )
})
