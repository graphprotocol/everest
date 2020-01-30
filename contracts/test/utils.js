const ethers = require('ethers')
const fs = require('fs')
const { time, expectEvent, expectRevert, constants } = require('openzeppelin-test-helpers')
var keccak256 = require('js-sha3').keccak_256
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

const randomIPFSBytes = '0x4444444444444444444444444440000000000000000000000000000000000000'
const randomBytes32 = ethers.utils.randomBytes(32)

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

// DAI_DOMAIN_SEPARATOR = keccak256(abi.encode(
//     keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
//     keccak256(bytes(name)),
//     keccak256(bytes(version)),
//     chainId_,
//     address(this)
// ));

// THIS DOES not WORK ^. czu dependant on the address

// DAI_PERMIT_TYPEHASH = keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)");
const DAI_PERMIT_TYPEHASH = '0xea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb'

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

    applySignedWithAttribute: async (newMember, owner, wallet) => {},

    // signTransaction: async (data, wallet) => {
    //     const hash = ethers.utils.keccak256(data)
    //     const hashArray = ethers.utils.arrayify(hash)
    //     let signedMessage = await wallet.signMessage(hashArray) // AUTO PREFIX Ethereum signed msg 19
    //     sig = ethers.utils.splitSignature(signedMessage)
    //     return sig
    // },

    applySigned: async (memberWallet, ownerWallet) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const everest = await Everest.deployed()
        const memberAddress = memberWallet.signingKey.address
        const memberPrivateKey = Buffer.from(
            module.exports.stripHexPrefix(memberWallet.signingKey.privateKey),
            'hex'
        )
        const ownerAddress = ownerWallet.signingKey.address
        const sig = await module.exports.signDataDIDRegistry(
            memberAddress,
            memberAddress,
            memberPrivateKey,
            Buffer.from('changeOwner').toString('hex') + module.exports.stripHexPrefix(ownerAddress)
        )
        tx = await didReg.changeOwnerSigned(memberAddress, sig.v, sig.r, sig.s, ownerAddress, {
            from: ownerAddress
        })
        const updatedOwner = await didReg.owners(memberAddress)
        assert.equal(updatedOwner, ownerAddress)
    },

    setAttribute: async (memberAddress, ownerWallet) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const ownerAddress = ownerWallet.signingKey.address
        const tx = await didReg.setAttribute(
            memberAddress,
            offChainDataName,
            randomIPFSBytes,
            offChainDataValidity,
            { from: ownerAddress }
        )
        const event = tx.logs[0]
        assert.equal(event.event, 'DIDAttributeChanged')
        assert.equal(event.args.identity, memberAddress)
        assert.equal(event.args.name, offChainDataName)
        assert.equal(event.args.value, randomIPFSBytes)
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

    stringToBytes: str => {
        return Buffer.from(str).toString('hex')
    },

    signDataDIDRegistry: async (identity, signer, key, data) => {
        const didReg = await EthereumDIDRegistry.deployed()
        const nonce = await didReg.nonce(signer)
        const paddedNonce = module.exports.leftPad(Buffer.from([nonce], 64).toString('hex'))
        const dataToSign =
            '1900' +
            module.exports.stripHexPrefix(didReg.address) +
            paddedNonce +
            module.exports.stripHexPrefix(identity) +
            data
        const hash = Buffer.from(keccak256.buffer(Buffer.from(dataToSign, 'hex')))
        const signature = ethutil.ecsign(hash, key)
        // const publicKey = ethutil.ecrecover(hash, signature.v, signature.r, signature.s)
        return {
            r: '0x' + signature.r.toString('hex'),
            s: '0x' + signature.s.toString('hex'),
            v: signature.v
        }
    },

    createDaiDomainSeparator: async () => {
        const domain = keccak256(
            'EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)'
        )
        const daiName = module.exports.stringToBytes('Dai Stablecoin')
        // TODO - change these from strings to intergerrs and change the
        // ints to bytes .... actually i cacn just hard code them
        const version = module.exports.stringToBytes('1')
        const chainID = module.exports.stringToBytes('9854')
        const daiAddress = (await Token.deployed()).address

        const paddedName = module.exports.leftPad(daiName)
        const paddedVersion = module.exports.leftPad(version)
        const paddedChainID = module.exports.leftPad(chainID)
        const paddedDaiAddress = module.exports.leftPad(module.exports.stripHexPrefix(daiAddress))

        console.log(paddedName)
        console.log(paddedVersion)
        console.log(paddedChainID)
        console.log(paddedDaiAddress)
    },

    signDataPermit: async (holderAddress, spenderAddress, holderPrivateKey, nonce) => {
        const paddedNonce = module.exports.leftPad(Buffer.from([nonce], 64).toString('hex'))
        const paddedExpiry = module.exports.leftPad(Buffer.from([0], 64).toString('hex'))
        const paddedTrue = module.exports.leftPad(Buffer.from([1], 64).toString('hex'))

        // DAI_DOMAIN_SEPARATOR = keccak256(abi.encode(
        //     keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"),
        //     keccak256(bytes(name)),
        //     keccak256(bytes(version)),
        //     chainId_,
        //     address(this)
        // ));

        // EXPECTED:
        // 0xdc191a50aa82bc523ab72bc7c67f9c2134a5b65bc1259373f99f71f803f56169

        // "0x90F8bf6A479f320ead074411a4B0e7944Ea8c9C1"
        // "0xFFcf8FDEE72ac11b5c542428B35EEF5769C409f0"
        const structEncoded =
            DAI_PERMIT_TYPEHASH +
            module.exports.leftPad(module.exports.stripHexPrefix(holderAddress)) +
            module.exports.leftPad(module.exports.stripHexPrefix(spenderAddress)) +
            paddedNonce +
            paddedExpiry +
            paddedTrue
        // console.log("OTHer: ", other.toLowerCase())

        module.exports.createDaiDomainSeparator()

        const dataToHash = '1901' + DAI_DOMAIN_SEPARATOR + keccak256(structEncoded)
        console.log('struct encoded: ', keccak256(structEncoded))
        const digest = Buffer.from(keccak256.buffer(Buffer.from(dataToHash, 'hex')))
        console.log('HOPED: ', digest)
        const signature = ethutil.ecsign(digest, holderPrivateKey)
        const publicKey = ethutil.ecrecover(digest, signature.v, signature.r, signature.s)
        // console.log(publicKey)
        // console.log(signature)
        return {
            r: '0x' + signature.r.toString('hex'),
            s: '0x' + signature.s.toString('hex'),
            v: signature.v
        }
    },

    daiPermit: async (holderWallet, spenderWallet) => {
        const token = await Token.deployed()
        const holderAddress = holderWallet.signingKey.address
        const spenderAddress = spenderWallet.signingKey.address
        const nonce = await token.nonces(holderAddress)
        const everest = await Everest.deployed()
        const holderPrivateKey = Buffer.from(
            module.exports.stripHexPrefix(holderWallet.signingKey.privateKey),
            'hex'
        )
        // const ownerAddress = spenderAddress.signingKey.address
        const sig = await module.exports.signDataPermit(
            holderAddress,
            spenderAddress,
            holderPrivateKey,
            nonce
        )
        tx = await token.permit(
            holderAddress,
            spenderAddress,
            nonce,
            0,
            true,
            sig.v,
            sig.r,
            sig.s,
            {
                from: spenderAddress
            }
        )
        const updatedAllowance = await token.allowance(holderAddress, spenderAddress)
        console.log('UA: ', updatedAllowance)
        // assert.equal(updatedOwner, spenderAddress)
    }
}

module.exports = utils
