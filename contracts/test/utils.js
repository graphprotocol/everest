const ethers = require('ethers')
const fs = require('fs')
const { time, expectEvent, expectRevert, constants, BN } = require('openzeppelin-test-helpers')

// const BN = require('bn.js') TODO - remove this and from package.json. We use BN from test helpers

// const url = 'http://localhost:8545';
// const provider = new ethers.providers.JsonRpcProvider(url);
// Getting the accounts
// const signer0 = provider.getSigner(0);
// const signer1 = provider.getSigner(1);
// const hello = JSON.parse(fs.readFileSync('./hello.txt'))
console.log(__dirname)
console.log(__filename)
const config = require('../conf/config.js')
const paramConfig = config.everestParams

const Registry = artifacts.require('Registry.sol')
const Everest = artifacts.require('Everest.sol')
const Token = artifacts.require('MockToken.sol')

/* Potential helpers for contract call flows
- applyMember() then increaseTime, then whitelist()
- applyMember() then challenge()
- applyMember() then increaseTime, then whitelist() then challenge()
- applyMember() then increaseTime, then whitelist(), thenExit
- applyMember() then increaseTime, then whitelist(), then edit ANY fields
- challenge() then vote() a few times, then increaseTime() then resolveChallenge()
*/

const utils = {
    increaseTime: async seconds => time.increase(seconds),

    getStringHash: domain =>
        `${ethers.utils.solidityKeccak256(['string'], [domain]).toString('hex')}`,

    expectRevert: async (tx, errorString) => expectRevert(tx, errorString),

    expectEvent: async (receipt, eventName, eventFields) =>
        expectEvent(receipt, eventName, eventFields),

    getReceiptValue: (receipt, arg) => receipt.logs[0].args[arg],

    ZERO_ADDRESS: constants.ZERO_ADDRESS,
    mockBytes32: '0xbabbabb9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',

    // challengeAndResolve: async

    applyAndWhitelist: async (memberName, bytesString, applicant, delegate) => {
        const everest = await Everest.deployed()
        await everest.applyMember(memberName, bytesString, applicant, delegate)
        await utils.increaseTime(paramConfig.whitelistPeriodDuration + 1)
        await everest.whitelist(memberName)
        const isWhitelisted = await everest.isWhitelisted(memberName)
        assert(isWhitelisted, 'Project was not whitelisted')
    }
}

module.exports = utils

// TODO - might use this, but trying to not use it if possible. Holding here for a bit
// A custom function that can handle any function with its arguments
// It can also handle the options object for EVM calls
// callFunction: (actor, fn, ...args) => {
//     function detectSendObject(potentialSendObj) {
//         function hasOwnProperty(obj, prop) {
//             const proto = obj.constructor.prototype
//             return prop in obj && (!(prop in proto) || proto[prop] !== obj[prop])
//         }
//         if (typeof potentialSendObj !== 'object') {
//             return undefined
//         }
//         if (
//             hasOwnProperty(potentialSendObj, 'from') ||
//             hasOwnProperty(potentialSendObj, 'to') ||
//             hasOwnProperty(potentialSendObj, 'gas') ||
//             hasOwnProperty(potentialSendObj, 'gasPrice') ||
//             hasOwnProperty(potentialSendObj, 'value')
//         ) {
//             throw new Error('It is unsafe to use "callFunction" with custom send objects')
//         }
//         return undefined
//     }
//     detectSendObject(args[args.length - 1]) // gets the options argument
//     const sendObject = {from: actor}
//     return fn(...args, sendObject)
// },

// TODO - clean this up, make sure it works with big numbers dk
// divideAndGetWei: (numerator, denominator) =>
//     // const weiNumerator = ethers.utils.parseEther(numerator.toString())
//     // const weiNumerator = Eth.toWei(BN(numerator), 'gwei');
//     // return weiNumerator.div(ethers.utils.bigNumberify(denominator));
//     numerator / denominator,

// // TODO - clean this up, make sure it works with big numbers dk
// multiplyFromWei: (x, weiBN) =>
//     // if (!Eth.BN.isBN(weiBN)) {
//     //   return false;
//     // }
//     // const weiProduct = ethers.utils.bigNumberify(x).mul(weiBN);
//     // console.log(weiProduct, "WEIPRO");
//     // return BN(Eth.fromWei(weiProduct, 'gwei'));
//     // return new BN(ethers.utils.formatUnits(weiProduct, "ether"), 10)
//     new BN(x * weiBN),

// multiplyByPercentage: (x, y, z = 100) => {
//     const weiQuotient = utils.divideAndGetWei(y, z)
//     return utils.multiplyFromWei(x, weiQuotient)
// }
