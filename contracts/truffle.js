// const fs = require('fs');

// let mnemonic;

// if (fs.existsSync('secrets.json')) {
//   const secrets = JSON.parse(fs.readFileSync('secrets.json', 'utf8'));
//   ({ mnemonic } = secrets);
// } else {
//   console.log('no secrets.json found. You can only deploy to ganache.');
//   // the default truffle mnemonic
//   mnemonic = 'myth like bonus scare over problem client lizard pioneer submit female collect';
// }

module.exports = {
    networks: {
        development: {
            network_id: '9854',
            host: '127.0.0.1',
            port: '8545',
            gas: 9900000,
            gasPrice: 20000000000,
            skipDryRun: true
        }
        // mainnet: {
        //     // Note, this must use the syntax () => new... otherwise it hangs forever on tests.
        //     // But do not use for development, only use for testnets or mainnet
        //     // Also, currently removed HDWalletProvider. It uses web3. This should be replaced
        //     // by the ethers solution. TODO
        //  provider: () => new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/v3/', 0, 10),
        //     network_id: '1'
        // }
    },
    // Note, right now we are just using the compiler that truffle comes with.
    // We might lock down a version later
    compilers: {
        solc: {
            // version: '0.5.8',
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    }
}
