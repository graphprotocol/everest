const config = {
    everestParams: {
        owner: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
        approvedToken: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
        votingPeriodDuration: 1200,
        challengeDeposit: '500000000000000000000',
        whitelistPeriodDuration: 1200,
        applicationFee: '100000000000000000000',
        charter: '0xb94d27b9934d3e08a52e52d7da7dabfac484efe37a5380ee9088f7ace2efcde9'
    },
    name: 'MockDAI',
    token: {
        address: '0xCfEB869F69431e42cdB54A4F4f105C19C080A601',
        deployToken: true,
        decimals: '18',
        name: 'MockDAI',
        symbol: 'MDAI',
        supply: '100000000000000000000000000',
        minter: {
            address: '0x90f8bf6a479f320ead074411a4b0e7944ea8c9c1',
            amount: '1000000000000000000000000000'
        },
        tokenHolders: [
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
