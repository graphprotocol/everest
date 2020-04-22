const Everest = artifacts.require('Everest.sol')
const Registry = artifacts.require('Registry.sol')
const ReserveBank = artifacts.require('ReserveBank.sol')
const Token = artifacts.require('./lib/Dai.sol')
const EthereumDIDRegistry = artifacts.require('EthereumDIDRegistry.sol')
const config = require('../conf/config.js')
const params = config.everestParams
const ethers = require('ethers')

module.exports = async (deployer, network) => {
    let tokenHolders
    let tokenMinter
    let chainID

    let owner
    let didAddress
    let daiAddress

    // Iterate through tokenHolders and give them each 20M MockDAI by recursion
    async function giveTokensTo(tokenHolders) {
        if (tokenHolders.length === 0) {
            return
        }
        const token = await Token.deployed()
        const tokenHolder = tokenHolders[0]

        const displayAmt = config.ropstenParams.amountToEachAccount.slice(
            0,
            config.ropstenParams.amountToEachAccount.length - parseInt(18, 10)
        )
        console.log(`Allocating ${displayAmt} DAI tokens to ` + `${tokenHolder}.`)
        await token.transfer(tokenHolder, config.ropstenParams.amountToEachAccount)
        giveTokensTo(tokenHolders.slice(1))
    }

    // Set up didAddress and owner depending on the network
    if (network == 'development') {
        tokenHolders = [
            // Zero is minter, starts with 100M, so skip it
            config.wallets.one().signingKey.address,
            config.wallets.two().signingKey.address,
            config.wallets.three().signingKey.address,
            config.wallets.four().signingKey.address
        ]
        tokenMinter = config.wallets.zero().signingKey.address
        chainID = 9545

        console.log('Deploying token to a test network and minting 100M DAI.....')
        await deployer.deploy(Token, chainID)

        console.log(`Giving tokens to ${tokenHolders.length} accounts`)
        const token = await Token.deployed()

        await token.mint(tokenMinter, config.ropstenParams.supply)
        await giveTokensTo(tokenHolders)

        owner = config.ganacheParams.owner
        // We must deploy our own DID registry for ganache
        await deployer.deploy(EthereumDIDRegistry)
        const edr = await EthereumDIDRegistry.deployed()
        didAddress = edr.address
        daiAddress = (await Token.deployed()).address
    } else if (network == 'ropsten' || network == 'ropsten-fork') {
        chainID = 3
        owner = config.ropstenParams.ropstenOwner
        didAddress = config.ropstenParams.ethereumDIDRegistryAddress

        // We are using a new ropsten DAI
        if (config.ropstenParams.daiAddress == null) {
            tokenHolders = [
                config.metamaskAddresses.one,
                config.metamaskAddresses.two,
                config.metamaskAddresses.three,
                config.metamaskAddresses.four
            ]
            tokenMinter = config.metamaskAddresses.zero
            console.log('Deploying token to a test network and minting 100M DAI.....')
            await deployer.deploy(Token, chainID)

            console.log(`Giving tokens to ${tokenHolders.length} accounts`)
            const token = await Token.deployed()

            await token.mint(tokenMinter, config.ropstenParams.supply)
            await giveTokensTo(tokenHolders)
            daiAddress = (await Token.deployed()).address

            // We are using an existing ropsten dai
        } else {
            console.log(`Using existing ropsten DAI address at ${config.ropstenParams.daiAddress}`)
            daiAddress = config.ropstenParams.daiAddress
        }
    } else if (network == 'mainnet' || network == 'mainnet-fork') {
        owner = config.mainnetParams.owner
        didAddress = config.mainnetParams.ethereumDIDRegistryAddress
        daiAddress = config.mainnetParams.daiAddress
        console.log('Deploying to mainnet, using mainnet DAI at ' + `${daiAddress}.`)
    } else {
        console.log("Unknown network. No addresses or owner set")
    }

    // Deploy the dependant contracts that must exist before Everest
    await deployer.deploy(ReserveBank, daiAddress, { from: owner })
    await deployer.deploy(Registry, { from: owner })

    const reserveBank = await ReserveBank.deployed()
    const registry = await Registry.deployed()

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
        params.startingChallengeIDNumber,
        { from: owner }
    )

    // The ownership of Registry and ReserveBank must be transferred to Everest
    console.log('Transferring ownership of registry to everest....')
    const ownershipRegistryTx = await registry.transferOwnership(everest.address, {
        gasPrice: ethers.utils.parseUnits('11', 'gwei')
    })
    console.log(`Transfer registry successful. Hash: ${ownershipRegistryTx.tx}`)

    console.log('Transferring ownership of reserve bank to everest....')
    const ownershipReserveBankTx = await reserveBank.transferOwnership(everest.address, {
        gasPrice: ethers.utils.parseUnits('11', 'gwei')
    })
    console.log(`Transfer reserve bank successful. Hash: ${ownershipReserveBankTx.tx}`)

    // Log all addresses of contracts
    console.log(`${network == 'mainnet' ? 'Mainnet' : 'mock'} DAI Address: ${daiAddress}`)
    console.log(`Ethr DID Address: ${didAddress}`)
    console.log(`ReserveBank Address: ${reserveBank.address}`)
    console.log(`Registry Address: ${registry.address}`)
    console.log(`Everest Address: ${everest.address}`)
}
