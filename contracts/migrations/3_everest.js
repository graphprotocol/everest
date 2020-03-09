const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const ReserveBank = artifacts.require('ReserveBank.sol')
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

    const reserveBank = await deployer.deploy(ReserveBank, daiAddress, { from: owner })
    const registry = await deployer.deploy(Registry, { from: owner })

    await deployer.deploy(
        Everest,
        daiAddress,
        params.votingPeriodDuration,
        params.challengeDeposit,
        params.applicationFee,
        params.charter,
        didAddress,
        reserveBank.address,
        registry.address,
        { from: owner }
    )
    const everest = await Everest.deployed()
    await registry.transferOwnership(everest.address)
    await reserveBank.transferOwnership(everest.address)
    console.log(`Mock DAI Address: ${daiAddress}`)
    console.log(`Ethr DID Address: ${didAddress}`)
    console.log(`ReserveBank Address: ${reserveBank.address}`)
    console.log(`Registry Address: ${registry.address}`)
    console.log(`Everest Address: ${everest.address}`)
}
