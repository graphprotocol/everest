const config = {
    everestParams: {
        owner: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1', // Ganache deterministic account 0
        ropstenOwner: '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd', // Daves metamask account 0
        approvedToken: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601', // Ganache MockDAI
        votingPeriodDuration: 432000, // 5 days, in seconds
        challengeDeposit: '500000000000000000000', // $50 DAI challenge fee
        fullMemberPeriodDuration: 259200, // 3 days, in seconds
        applicationFee: '100000000000000000000', // $10 DAI application fee
        // Charter is fake IPFS hash, in bytes, not base58
        charter: '0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    },
    // We deploy a new token for any test network. Mainnet we use real dai
    name: 'MockDAI',
    token: {
        mainnetAddress: '0x6b175474e89094c44da98b954eedeac495271d0f', // mainnet DAI address
        deployTestingToken: true, // set to false when deploying to mainnet
        decimals: '18',
        name: 'MockDAI',
        symbol: 'MDAI',
        supply: '100000000000000000000000000', // $100 M MockDAI supply
        // Minter gets all $100 M to start, and then sends $25 M to three accounts
        minter: {
            address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            amount: '1000000000000000000000000000'
        },
        ropstenMinter: {
            address: '0x93606b27cB5e4c780883eC4F6b7Bed5f6572d1dd',
            amount: '1000000000000000000000000000'
        },
        ropstenTokenHolders: [
            // Other accounts in Daves metamask
            {
                address: '0x7F11E5B7Fe8C04c1E4Ce0dD98aC5c922ECcfA4ed',
                amount: '25000000000000000000000000'
            },
            {
                address: '0x140b9b9756cE3dE8c8fD296FC9D3E7B3AAa1Cb16',
                amount: '25000000000000000000000000'
            },
            {
                address: '0x14B98b26D82421a27608B21BaF6BdEfc181DE546',
                amount: '25000000000000000000000000'
            }
        ],
        tokenHolders: [
            // accounts 1,2 and 3 from ganache deterministic mnemonic
            {
                address: '0xffcf8fdee72ac11b5c542428b35eef5769c409f0',
                amount: '25000000000000000000000000'
            },
            {
                address: '0x22d491bde2303f2f43325b2108d26f1eaba1e32b',
                amount: '25000000000000000000000000'
            },
            {
                address: '0xe11ba2b4d45eaed5996cd0823791e0c93114882d',
                amount: '25000000000000000000000000'
            }
        ]
    }
}

module.exports = config
