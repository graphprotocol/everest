const fs = require('fs')
const path = require('path')
const ethers = require('ethers')
const HDWalletProvider = require('@truffle/hdwallet-provider')

// There seems to be no easy way to avoid deploying with truffle and having
// to use HDWallerProvider. This package has  yarn errors, but still works with the errors
// Discussions in ethers here https://github.com/ethers-io/ethers.js/issues/147
// and here https://github.com/ethers-io/ethers.js/issues/71 for potential ethers deployments
// For now, we use HDWalletProvider, since it works.

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
            provider: () =>
                new HDWalletProvider(
                    fs.readFileSync(path.join(__dirname, '.privkey.txt'), 'utf-8').trim(),
                    `https://ropsten.infura.io/v3/${fs
                        .readFileSync(path.join(__dirname, '/.infurakey.txt'), 'utf-8')
                        .trim()}`,
                    0,
                    4 // Create 4 addresses, which are funded with MockDAI
                ),
            network_id: 3,
            gasPrice: ethers.utils.parseUnits('8', 'gwei'), 
            skipDryRun: true
        },
        rinkeby: {
            provider: () =>
                new HDWalletProvider(
                    fs.readFileSync(path.join(__dirname, '.privkey.txt'), 'utf-8').trim(),
                    `https://ropsten.infura.io/v3/${fs
                        .readFileSync(path.join(__dirname, '/.infurakey.txt'), 'utf-8')
                        .trim()}`,
                    0,
                    4 // Create 4 addresses, which are funded with MockDAI
                ),
            network_id: 4,
            gasPrice: ethers.utils.parseUnits('25', 'gwei'),
            skipDryRun: true
        },
        mainnet: {
            provider: () =>
                new HDWalletProvider(
                    fs.readFileSync(path.join(__dirname, '.privkey.txt'), 'utf-8').trim(),
                    `https://infura.io/v3/${fs
                        .readFileSync(path.join(__dirname, '/.infurakey.txt'), 'utf-8')
                        .trim()}`,
                    0,
                    1 // Only need 1 address
                ),
            network_id: 1,
            gasPrice: ethers.utils.parseUnits('8', 'gwei'),
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
