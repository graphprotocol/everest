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
          address: addresses.mainnet.everest,
          blockNumber: '9780000',
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
          address: addresses.ropsten.everest,
          blockNumber: '7300000',
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
