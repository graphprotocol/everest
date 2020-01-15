const fs = require('fs')
const path = require('path')
const ethers = require('ethers')
const HDWalletProvider = require('@truffle/hdwallet-provider')

// There seems to be no good way to avoid deploying with truffle and having
// to use HDWallerProvider. This package has ugly yarn errors, but appears to still
// work with the errors
// Discussions in ethers here https://github.com/ethers-io/ethers.js/issues/147
// and here https://github.com/ethers-io/ethers.js/issues/71
// For now, we use HDWalletProvider, since it works.

module.exports = {
    networks: {
        development: {
            network_id: '9854',
            host: '127.0.0.1',
            port: '8545',
            gas: 9900000, // Current gas limit on mainnet (Jan 2020)
            gasPrice: 20000000000,
            skipDryRun: true
        },
        // Note, this must use the syntax () => new... otherwise it hangs forever on tests.
        ropsten: {
            provider: () =>
                new HDWalletProvider(
                    fs.readFileSync(path.join(__dirname, '.privkey.txt'), 'utf-8').trim(),
                    `https://ropsten.infura.io/v3/${fs
                        .readFileSync(path.join(__dirname, '/.infurakey.txt'), 'utf-8')
                        .trim()}`,
                    0,
                    4 // Create 4 addresses, which are funded with MockDAI
                ),
            network_id: 3, // Ropsten's id
            //gas: 8000000,
            gasPrice: ethers.utils.parseUnits('11', 'gwei'), // To easily get in blocks on ropsten
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
            network_id: 3, // Ropsten's id
            //gas: 8000000,
            gasPrice: ethers.utils.parseUnits('11', 'gwei'), // To easily get in blocks on ropsten
            skipDryRun: true
        }
    },
    // Note, right now we are just using the compiler that truffle comes with.
    // We might lock down a version later
    compilers: {
        solc: {
            // version: '0.5.8',
            settings: {
                optimizer: {
                    enabled: true,
                    runs: 200
                }
            }
        }
    }
}
