const fs = require('fs')
const ethers = require('ethers')
const HDWalletProvider = require('@truffle/hdwallet-provider')

// There seems to be no easy way to avoid deploying with truffle and having
// to use HDWallerProvider. This package has  yarn errors, but still works with the errors
// Discussions in ethers here https://github.com/ethers-io/ethers.js/issues/147
// and here https://github.com/ethers-io/ethers.js/issues/71 for potential ethers deployments
// For now, we use HDWalletProvider, since it works.

const mnemonic = fs
    .readFileSync(__dirname + '/../../../private-keys/.privkey-metamask.txt')
    .toString()
    .trim()
const mainnetProvider = `https://infura.io/v3/${fs
    .readFileSync(__dirname + '/../../../private-keys/.infurakey.txt')
    .toString()
    .trim()}`
const ropstenProvider = `https://ropsten.infura.io/v3/${fs
    .readFileSync(__dirname + '/../../../private-keys/.infurakey.txt')
    .toString()
    .trim()}`

module.exports = {
    networks: {
        development: {
            network_id: '9545',
            host: '127.0.0.1',
            port: '8545',
            gas: 9900000, // Current gas limit on mainnet (Jan 2020)
            gasPrice: 20000000000,
            skipDryRun: true
        },
        ropsten: {
            // Note, this must use the syntax () => new... otherwise it hangs forever on tests.
            // 4 is for 4 addresses for mock dai
            provider: () => new HDWalletProvider(mnemonic, ropstenProvider, 0, 4),
            network_id: 3,
            gasPrice: ethers.utils.parseUnits('25', 'gwei'),
            skipDryRun: true
        },
        mainnet: {
            // one need one address in HD wallet
            provider: () => new HDWalletProvider(mnemonic, mainnetProvider, 0, 1),
            network_id: 1,
            gasPrice: ethers.utils.parseUnits('8', 'gwei')
        }
    },
    compilers: {
        solc: {
            version: '0.5.8',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
}
