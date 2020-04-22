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
          blockNumber: addresses.mainnet.blockNumber,
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
          blockNumber: addresses.ropsten.blockNumber,
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
