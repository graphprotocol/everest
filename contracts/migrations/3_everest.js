const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const ReserveBank = artifacts.require('ReserveBank.sol')
const Token = artifacts.require('./lib/Dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const config = require('../conf/config.js')
const params = config.everestParams

module.exports = async (deployer, network) => {
    let owner
    let didAddress
    let daiAddress

    // Set up didAddress and owner depending on the network
    if (network === 'development') {
        owner = params.owner
        // We must deploy our own DID registry for ganache
        await deployer.deploy(EthereumDIDRegistry)
        const edr = await EthereumDIDRegistry.deployed()
        didAddress = edr.address
        daiAddress = (await Token.deployed()).address
    } else if (network === 'ropsten') {
        owner = config.ropstenParams.ropstenOwner
        didAddress = config.ropstenParams.ethereumDIDRegistryAddress
        daiAddress = (await Token.deployed()).address
    } else if (network === 'mainnet'){
        daiAddress = config.mainnetParams.daiAddress
    }

    // Deploy the dependant contracts that must exist before Everest
    const reserveBank = await deployer.deploy(ReserveBank, daiAddress, { from: owner })
    const registry = await deployer.deploy(Registry, { from: owner })

    // Deploy Everest
    const everest = await deployer.deploy(
        Everest,
        daiAddress,
        params.votingPeriodDuration,
        params.challengeDeposit,
        params.applicationFee,
        params.charter,
        params.categories,
        didAddress,
        reserveBank.address,
        registry.address,
        { from: owner }
    )

    // The ownership of Registry and ReserveBank must be transferred to Everest
    await registry.transferOwnership(everest.address)
    await reserveBank.transferOwnership(everest.address)

    // Log all addresses of contracts
    network
    console.log(`${network === 'mainnet'? "Mock": "Mainnet"} DAI Address: ${daiAddress}`)
    console.log(`Ethr DID Address: ${didAddress}`)
    console.log(`ReserveBank Address: ${reserveBank.address}`)
    console.log(`Registry Address: ${registry.address}`)
    console.log(`Everest Address: ${everest.address}`)
}
