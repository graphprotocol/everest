/* Tests all member functionality, which is:
- applyMember()
- whiteList()
- memberExit()
- editMemberOwner()
- editOffchainData()
- editDelegate()
- getters
    - isWhiteListed()
*/

const Everest = artifacts.require('Everest.sol')
const fs = require('fs')
const config = require('../../conf/config.js')
const paramConfig = config.everestParams
const utils = require('../utils.js')
// const BN = require('bn.js')can get from uti;s

// contract('Everest', accounts => {
//     const [everestOwner, applicant, delegate] = accounts
//     const memberName = 'The Graph'
//     describe('Member joining and leaving. Functions: applyMember(), whitelist(), memberExit(), isWhiteListed()', () => {
//         it('should allow a member to apply, pass time, and get whitelisted', async () => {
//             await utils.applyAndWhitelist(memberName, utils.mockBytes32, applicant, delegate)
//         })

//         it('should allow a member to exit', async () => {
//             const everest = await Everest.deployed()
//             await everest.memberExit(memberName, {from: applicant})
//             const isWhitelisted = await everest.isWhitelisted(memberName)
//             assert(!isWhitelisted, 'Project was removed from whitelist')
//         })
//     })
//     describe('Member editing. Functions: editMemberOwner(), editOffchainData(), editDelegate()', () => {
//         it('should allow only owner (not delegate) to editMemberOwner()', async () => {})

//         it('should allow  owner and delegate to call editOffChainData()', async () => {})

//         it('should allow owner and delegate to call editDelegate()', async () => {})

//         it('should allow only owner (not delegate) to edit owner', async () => {})
//     })
// })
