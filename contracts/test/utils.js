const ethers = require('ethers')
const fs = require('fs')
const { time, expectEvent, expectRevert, constants } = require('openzeppelin-test-helpers')
var sha3 = require('js-sha3').keccak_256
var ethutil = require('ethereumjs-util')
var BN = require('bn.js')

// const BN = require('bn.js') TODO - remove this and from package.json. We use BN from test helpers

// const url = 'http://localhost:8545';
// const provider = new ethers.providers.JsonRpcProvider(url);
// Getting the accounts
// const signer0 = provider.getSigner(0);
// const signer1 = provider.getSigner(1);
// const hello = JSON.parse(fs.readFileSync('./hello.txt'))
// console.log(__dirname)
// console.log(__filename)
const config = require('../conf/config.js')
const paramConfig = config.everestParams

const Registry = artifacts.require('Registry.sol')
const Everest = artifacts.require('Everest.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const Token = artifacts.require('dai.sol')

// The deterministic flag mneumonic
const ganacheMneumonic =
    'myth like bonus scare over problem client lizard pioneer submit female collect'
// offChainDataName = bytes32('ProjectData')
const offChainDataName = '0x50726f6a65637444617461000000000000000000000000000000000000000000'
// 100 years, an artbitrary value we pass since we don't use validity in V1
const offChainDataValidity = 3153600000

const randomBytes32 = ethers.utils.randomBytes(32)

// Struct Data type
const sigArgTypes = [
    'bytes1', // 0x19
    'bytes1', // 0x0
    'address', // etherDIDRegistry address
    'uint256', // nonce
    'address', // newMember (aka identity)
    'string', // 'changeOwner'
    'address' // owner
]

const privateKey = Buffer.from(
    'a285ab66393c5fdda46d6fbad9e27fafd438254ab72ad5acb681a0e9f20f5d7b',
    'hex'
)
const signerAddress = '0x2036C6CD85692F0Fb2C26E6c6B2ECed9e4478Dfd'

const privateKey2 = Buffer.from(
    'a285ab66393c5fdda46d6fbad9e27fafd438254ab72ad5acb681a0e9f20f5d7a',
    'hex'
)
const signerAddress2 = '0xEA91e58E9Fa466786726F0a947e8583c7c5B3185'

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

    ethersWallet: path => ethers.Wallet.fromMnemonic(ganacheMneumonic, path),

    walletPaths: {
        zero: "m/44'/60'/0'/0/0",
        one: "m/44'/60'/0'/0/1",
        two: "m/44'/60'/0'/0/2",
        three: "m/44'/60'/0'/0/3",
        four: "m/44'/60'/0'/0/4",
        five: "m/44'/60'/0'/0/5",
        six: "m/44'/60'/0'/0/6",
        seven: "m/44'/60'/0'/0/7",
        eight: "m/44'/60'/0'/0/8",
        nine: "m/44'/60'/0'/0/9"
    },

    getIdentityNonce: async identity => {
        const etherDIDRegistry = await EthereumDIDRegistry.deployed()
        return etherDIDRegistry.nonce(identity)
    },

    getStringHash: domain =>
        `${ethers.utils.solidityKeccak256(['string'], [domain]).toString('hex')}`,

    expectRevert: async (tx, errorString) => expectRevert(tx, errorString),

    expectEvent: async (receipt, eventName, eventFields) =>
        expectEvent(receipt, eventName, eventFields),

    getReceiptValue: (receipt, arg) => receipt.logs[0].args[arg],

    ZERO_ADDRESS: constants.ZERO_ADDRESS,
    mockBytes32: '0xbabbabb9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',

    // challengeAndResolve: async

    applySignedWithAttribute: async (newMember, owner, wallet) => {
        // const etherDIDRegistry = await EthereumDIDRegistry.deployed()
        // const nonceChangeOwner = await module.exports.getIdentityNonce(newMember)
        // // Convert from web3 big number to js number. This is OK since we know nonce is a small
        // // number. It is a work around for the big number ethers/web3 problem
        // const nonceChangeOwnerNum = Number(nonceChangeOwner.toString())
        // // Must add one, since our solidity function wraps two ethrDIDRegistry functions
        // const nonceSetAttribute = nonceChangeOwnerNum + 1
        // let changeOwnerSignedData = ethers.utils.solidityKeccak256(
        //     ['bytes1', 'bytes1', 'address', 'uint256', 'address', 'string', 'address'],
        //     ['0x19', '0x0', etherDIDRegistry.address, 0, newMember, 'changeOwner', owner]
        // )
        // let setAttributeSignedData = ethers.utils.solidityKeccak256(
        //     [
        //         'bytes1',
        //         'bytes1',
        //         'address',
        //         'uint256',
        //         'address',
        //         'string',
        //         'bytes32',
        //         'bytes',
        //         'uint256'
        //     ],
        //     [
        //         '0x19',
        //         '0x0',
        //         etherDIDRegistry.address,
        //         1,
        //         newMember,
        //         'setAttribute',
        //         offChainDataName,
        //         offChainDataValue,
        //         offChainDataValidity
        //     ]
        // )
        // // console.log('DAATA1: ', changeOwnerSignedData)
        // // console.log('DATA2: ', setAttributeSignedData)
        // let applySig = await module.exports.signTransaction(
        //     // nonceChangeOwnerNum,
        //     // etherDIDRegistry.address,
        //     changeOwnerSignedData,
        //     wallet
        // )
        // let attributeSig = await module.exports.signTransaction(
        //     // nonceSetAttribute,
        //     // etherDIDRegistry.address,
        //     setAttributeSignedData,
        //     wallet
        // )
        // // console.log('Change owner: ', changeOwnerSig)
        // // console.log('Set attribute: ', setAttributeSig)
        // const everest = await Everest.deployed()
        // await everest.applySignedWithAttribute(
        //     newMember,
        //     applySig.v,
        //     applySig.r,
        //     applySig.s,
        //     owner,
        //     attributeSig.v,
        //     attributeSig.r,
        //     attributeSig.s,
        //     offChainDataName,
        //     randomBytes32,
        //     offChainDataValidity
        // )
        // assert isMember()
    },

    signTransaction: async (data, wallet) => {
        const hash = ethers.utils.keccak256(data)
        const hashArray = ethers.utils.arrayify(hash)
        let signedMessage = await wallet.signMessage(hashArray) // AUTO PREFIX Ethereum signed msg 19
        sig = ethers.utils.splitSignature(signedMessage)
        return sig
    },

    applySigned: async (owner, wallet) => {
        const didReg = await EthereumDIDRegistry.deployed()
        let newMember = wallet.signingKey.address

        const sig = await module.exports.signData(
            signerAddress,
            signerAddress,
            privateKey,
            Buffer.from('changeOwner').toString('hex') +
                module.exports.stripHexPrefix(signerAddress2)
        )
        tx = await didReg.changeOwnerSigned(signerAddress, sig.v, sig.r, sig.s, signerAddress2, {
            from: '0x1dF62f291b2E969fB0849d99D9Ce41e2F137006e' //temp random acct
        })
        const owner2 = await didReg.owners(signerAddress)
        console.log('Owner 2: ', owner2)
        console.log('signerAddress2: ', signerAddress2)
        assert.equal(owner2, signerAddress2)
        // Packed encoding of transfer signature message
        // sigData = ethers.utils.solidityPack(sigArgTypes, [
        //     '0x19',
        //     '0x00',
        //     etherDIDRegistry.address,
        //     0, // TODO - make this a contract call, since nonce isn't FORSURE 0
        //     newMember, // aka identity
        //     'changeOwner',
        //     owner
        // ])

        // const hash = ethers.utils.keccak256(sigData)
        // const hashArray = ethers.utils.arrayify(hash)
        // let signedMessage = await wallet.signMessage(hashArray)
        // sig = ethers.utils.splitSignature(signedMessage)

        // let payload = ethers.utils.defaultAbiCoder.encode(sigArgTypes, [
        //     '0x19',
        //     '0x00',
        //     etherDIDRegistry.address,
        //     0, // TODO - make this a contract call, since nonce isn't FORSURE 0
        //     newMember, // aka identity
        //     'changeOwner',
        //     owner
        // ])

        // console.log('Payload:', payload)

        // let payloadHash = ethers.utils.keccak256(payload)
        // console.log('PayloadHash:', payloadHash)

        // // See the note in the Solidity; basically this would save 6 gas and
        // // can potentially add security vulnerabilities in the future
        // // let payloadHash = ethers.utils.solidityKeccak256([ "bytes32", "string" ], [ someHash, someDescr ]);

        // let signature = await wallet.signMessage(ethers.utils.arrayify(payloadHash)) // This adds the message prefix

        // let sig = ethers.utils.splitSignature(signature)
        // console.log('Signature:', sig)

        // console.log(
        //     'Recovered:',
        //     ethers.utils.verifyMessage(ethers.utils.arrayify(payloadHash), sig)
        // )

        // await etherDIDRegistry.changeOwnerSigned(newMember, sig.v, sig.r, sig.s, owner, {
        //     from: newMember
        // })
    },

    /*
     * @param newMember - The project address that is created in the browser and thrown away
     * @param owner     - The users address, which is becoming the owner of the project
     * @param wallet    - The ethers.js wallet object of the project (to be thrown away)
     */
    permitSignature: async (newMember, owner, wallet) => {
        const token = Token.deployed()
        // const nonce = token.nonces()

        // nonce will always be one, then this account gets thrown away . we make it max, because
        // it will be

        // Convert from web3 big number to js number. This is OK since we know nonce is a small
        // number. It is a work around for the big number ethers/web3 problem
        // const nonceChangeOwnerNum = Number(nonceChangeOwner.toString())
        // Must add one, since our solidity function wraps two ethrDIDRegistry functions
        let permitSignedData = ethers.utils.solidityKeccak256(
            ['bytes1', 'bytes1', 'address', 'address', 'uint256', 'uint256', 'bool'],
            [
                '0x19',
                '0x0',
                newMember,
                owner,
                1, // nonce always starts at 1
                0, // allowance never expires
                true // to represent an infinite amount of allowance
            ]
        )
        let permitSig = await module.exports.signTransaction(permitSignedData, wallet)
        return permitSig
    },
    leftPad: (data, size = 64) => {
        if (data.length === size) return data
        return '0'.repeat(size - data.length) + data
    },
    stripHexPrefix: str => {
        if (str.startsWith('0x')) {
            return str.slice(2)
        }
        return str
    },
    signData: async (identity, signer, key, data) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const nonce = await didReg.nonce(signer)
        const paddedNonce = module.exports.leftPad(Buffer.from([nonce], 64).toString('hex'))
        const dataToSign =
            '1900' +
            module.exports.stripHexPrefix(didReg.address) +
            paddedNonce +
            module.exports.stripHexPrefix(identity) +
            data
        const hash = Buffer.from(sha3.buffer(Buffer.from(dataToSign, 'hex')))
        const signature = ethutil.ecsign(hash, key)
        const publicKey = ethutil.ecrecover(hash, signature.v, signature.r, signature.s)
        return {
            r: '0x' + signature.r.toString('hex'),
            s: '0x' + signature.s.toString('hex'),
            v: signature.v
        }
    }
}

// module.exports.etherDIDRegistryUtils = etherDIDRegistryUtils
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
