const ethers = require('ethers')
const base = require('base-x')
const fs = require('fs')

const ganacheMneumonic =
    'myth like bonus scare over problem client lizard pioneer submit female collect'

const walletPaths = {
    zero: "m/44'/60'/0'/0/0",
    one: "m/44'/60'/0'/0/1",
    two: "m/44'/60'/0'/0/2",
    three: "m/44'/60'/0'/0/3",
    four: "m/44'/60'/0'/0/4",
    five: "m/44'/60'/0'/0/5",
    six: "m/44'/60'/0'/0/6",
    seven: "m/44'/60'/0'/0/7",
    eight: "m/44'/60'/0'/0/8",
    nine: "m/44'/60'/0'/0/9",
    ten: "m/44'/60'/0'/0/10"
}

const categoriesIPFSHash = fs
    .readFileSync(__dirname + '/ipfs-sync/categories.txt')
    .toString()
    .trim()

const charterIPFShash = fs
    .readFileSync(__dirname + '/ipfs-sync/charter.txt')
    .toString()
    .trim()

const ipfsToBytes = ipfsHash => {
    const base58 = base('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz')
    const bytes32 =
        '0x' +
        base58
            .decode(ipfsHash)
            .slice(2)
            .toString('hex')
    return bytes32
}

const wallets = {
    zero: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.zero),
    one: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.one),
    two: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.two),
    three: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.three),
    four: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.four),
    five: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.five),
    six: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.six),
    seven: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.seven),
    eight: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.eight),
    nine: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.nine),
    ten: () => ethers.Wallet.fromMnemonic(ganacheMneumonic, walletPaths.ten)
}
const config = {
    everestParams: {
        votingPeriodDuration: 172800, // 2 days, in seconds
        challengeDeposit: '10000000000000000000', // $10 DAI challenge fee
        applicationFee: '10000000000000000000', // $10 DAI application fee
        // This points to the charter TODO - update mainnet
        charter: ipfsToBytes(charterIPFShash),
        // Point to IPFS hash of categories. TODO - update mainnnet
        categories: ipfsToBytes(categoriesIPFSHash),
        startingChallengeIDNumber: 1 // starts at 1, future deployments must pull from old everest
    },
    ganacheParams: {
        chainID: 9545,
        owner: wallets.zero().signingKey.address // Ganache deterministic account 0
    },
    ropstenParams: {
        supply: '100000000000000000000000000', // $100M DAI supply
        amountToEachAccount: '20000000000000000000000000', // $20M DAI to 5 accounts
        name: 'MockDAI',
        // Note the DID address is the same for mainnet, ropsten, rinkeby, kovan and goerli
        ethereumDIDRegistryAddress: '0xdca7ef03e98e0dc2b855be647c39abe984fcf21b',
        ropstenOwner: '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd', // Daves metamask account 0
        chainID: 3,
        daiAddress: '0x82a351cdfb726dafc8624d8bd6b0bc98d34ffec1' // Set to null if desired to deploy new dai
    },
    mainnetParams: {
        daiAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
        ethereumDIDRegistryAddress: '0xdCa7EF03e98e0DC2B855bE647C39ABe984fcF21B',
        owner: '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd' // Daves metamask account 0
    },
    // Used for deploying and interacting on testnets
    metamaskAddresses: {
        zero: '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd',
        one: '0x7F11E5B7Fe8C04c1E4Ce0dD98aC5c922ECcfA4ed',
        two: '0x140b9b9756cE3dE8c8fD296FC9D3E7B3AAa1Cb16',
        three: '0x14B98b26D82421a27608B21BaF6BdEfc181DE546',
        four: '0xbEb1Faa6E7e39c7d9BdaB03a7a362fE9d73D7C61'
    },
    wallets: wallets
}
module.exports = config
