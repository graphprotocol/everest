const ethers = require('ethers')
const { time, expectEvent, expectRevert, constants } = require('openzeppelin-test-helpers')
const BN = require('bn.js')

const config = require('../conf/config.js')
const paramConfig = config.everestParams

const utils = {
    // ---------
    // Constants
    // ---------

    applyFeeBN: new BN(paramConfig.applicationFee),
    challengeDepositBN: new BN(paramConfig.challengeDeposit),
    challengeRewardBN: new BN(paramConfig.challengeDeposit).div(new BN(10)),
    ZERO_ADDRESS: constants.ZERO_ADDRESS,
    mockIPFSData: '0xbabbabb9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9',
    offChainDataName: 'ProjectData',
    // Setting validity to max uint256 value, since we don't plan to use validity
    maxValidity: 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    // DAI_PERMIT_TYPEHASH = keccak256("Permit(address holder,address spender,uint256 nonce,uint256 expiry,bool allowed)");
    DAI_PERMIT_TYPEHASH: 'ea2aa0a1be11a07ed86d755c93467f4f82362b452371d1ba94d1715123511acb',

    // --------------------------
    // Open Zeppelin Test Helpers
    // --------------------------

    increaseTime: async seconds => time.increase(seconds),
    votePeriod: paramConfig.votingPeriodDuration,

    expectRevert: async (tx, errorString) => expectRevert(tx, errorString),

    expectEvent: async (receipt, eventName, eventFields) =>
        expectEvent(receipt, eventName, eventFields),

    // ------
    // Ethers
    // ------
    ethersWallet: path => ethers.Wallet.fromMnemonic(ganacheMneumonic, path),

    wallets: config.wallets,

    getStringHash: domain =>
        `${ethers.utils.solidityKeccak256(['string'], [domain]).toString('hex')}`,

    // -----------------
    // Byte Manipulation
    // -----------------

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

    bytes32ToString: bytes => {
        return Buffer.from(bytes.slice(2).split('00')[0], 'hex').toString()
    },

    stringToBytes32: str => {
        const buffstr = Buffer.from(str).toString('hex')
        return buffstr + '0'.repeat(64 - buffstr.length)
    }
}

module.exports = utils
