const fs = require('fs')

function readAndWriteFile(filename, onFileContent, onError) {
  fs.readFile(filename, 'utf-8', (err, content) => {
    if (err) {
      onError(err)
      return
    }
    onFileContent(content)
  })
}

readAndWriteFile(
  __dirname + '/../../contracts/addresses.json',
  content => {
    const addresses = JSON.parse(content)
    fs.writeFileSync(
      __dirname + '/mainnet.json',
      JSON.stringify(
        {
          network: 'mainnet',
          everestAddress: addresses.mainnet.everest,
          everestAddressOld: addresses.mainnet.oldEverest,
          blockNumber: addresses.mainnet.blockNumber,
          blockNumberOld: addresses.mainnet.oldBlockNumber,
        },
        null,
        2,
      ),
    )
    fs.writeFileSync(
      __dirname + '/ropsten.json',
      JSON.stringify(
        {
          network: 'ropsten',
          everestAddress: addresses.ropsten.everest,
          everestAddressOld: addresses.ropsten.oldEverest,
          blockNumber: addresses.ropsten.blockNumber,
          blockNumberOld: addresses.ropsten.oldBlockNumber,
        },
        null,
        2,
      ),
    )
  },
  err => {
    console.log('error: ', err)
    throw err
  },
)
