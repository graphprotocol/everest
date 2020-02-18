const Everest = artifacts.require('Everest.sol')
const Token = artifacts.require('./lib/Dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const config = require('../conf/config.js')
const params = config.everestParams

module.exports = async (deployer, network, accounts) => {
    let owner
    let didAddress
    if (network === 'development') {
        owner = params.owner
        // We must deploy our own DID registry for ganache
        await deployer.deploy(EthereumDIDRegistry)
        const edr = await EthereumDIDRegistry.deployed()
        didAddress = edr.address
    } else if (network === 'ropsten') {
        owner = config.ropstenParams.ropstenOwner
        didAddress = config.ropstenParams.ethereumDIDRegistryAddress
    }

    let daiAddress = (await Token.deployed()).address

    await deployer.deploy(
        Everest,
        daiAddress,
        params.votingPeriodDuration,
        params.challengeDeposit,
        params.applicationFee,
        params.charter,
        didAddress,
        { from: owner }
    )
    const everest = await Everest.deployed()
    const reserveBankAddr = await everest.reserveBank()
    console.log(`Mock DAI Address: ${daiAddress}`)
    console.log(`Ethr DID Address: ${didAddress}`)
    console.log(`Everest Address: ${everest.address}`)
    console.log(`Reserve Bank Address: ${reserveBankAddr.toString()}`)
}
