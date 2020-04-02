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
    console.log(addresses)
    fs.writeFileSync(
      'mainnet.json',
      JSON.stringify({ network: 'mainnet', address: addresses.mainnet.everest }, null, 2),
    )
    fs.writeFileSync(
      'ropsten.json',
      JSON.stringify({ network: 'ropsten', address: addresses.ropsten.everest }, null, 2),
    )
  },
  err => {
    console.log('error: ', err)
    throw err
  },
)
