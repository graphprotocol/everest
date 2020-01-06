/* Tests all member functionality, which is:
- apply
    - applySignedInternal()
        - confirm it is an internal function
    - applySigned()
        - Confirm it works
        - Test applySignedInternal() here
    - applySignedWithDelegate()
        - just test it does what it is supposed to, because it is two wrapped funcs
    - applySignedWithAttribute()
        - just test it does what it is supposed to, because it is two wrapped funcs
    - applySignedWithAttributeAndDelegate()
        - just test it does what it is supposed to, because it is three wrapped funcs

    - What should it do?
        - Apply, wait, be implicitly approve
        - Apply, get challenged, lose voting ability, pass challenge, gain voting
        - Apply, get challenged, lose ability
        - Member exit in application or in 
        - notes
            - a member can challengee or vote, that is all to note for testing
- memberExit()
- edit member functions
    - changeOwnerSigned()
    - editOffChainDataSigned()
    - addDelegateSigned()
    - revokeDelegateSigned()
- getters
    - isMember()
    -   make sure it works
*/

const Everest = artifacts.require('Everest.sol')
const fs = require('fs')
const config = require('../../conf/config.js')
const paramConfig = config.everestParams
const utils = require('../utils.js')
// const BN = require('bn.js')can get from uti;s

contract('Everest', accounts => {
    const [everestOwner, applicant, delegate] = accounts
    const memberName = 'The Graph'
    describe('Member joining and leaving. Functions: applyMember(), whitelist(), memberExit(), isWhiteListed()', () => {
        it('should allow a member to apply, pass time, and get whitelisted', async () => {
            await utils.applyAndWhitelist(memberName, utils.mockBytes32, applicant, delegate)
        })

        it('should allow a member to exit', async () => {
            const everest = await Everest.deployed()
            await everest.memberExit(memberName, { from: applicant })
            const isWhitelisted = await everest.isWhitelisted(memberName)
            assert(!isWhitelisted, 'Project was removed from whitelist')
        })
    })
    describe('Member editing. Functions: editMemberOwner(), editOffchainData(), editDelegate()', () => {
        it('should allow only owner (not delegate) to editMemberOwner()', async () => {})

        it('should allow  owner and delegate to call editOffChainData()', async () => {})

        it('should allow owner and delegate to call editDelegate()', async () => {})

        it('should allow only owner (not delegate) to edit owner', async () => {})
    })
})
