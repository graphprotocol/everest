const fs = require('fs')

function readFiles(dirname, onFileContent, onError) {
    fs.readdir(dirname, (err, filenames) => {
        if (err) {
            onError(err)
            return
        }
        filenames.forEach(function(filename) {
            fs.readFile(dirname + filename, 'utf-8', (err, content) => {
                if (err) {
                    onError(err)
                    return
                }
                onFileContent(filename, content)
            })
        })
    })
}

readFiles(
    'build/contracts/',
    (filename, content) => {
        const abi = JSON.parse(content).abi
        fs.writeFileSync('abis/' + filename, JSON.stringify({ abi }, null, 2))
    },
    err => {
        console.log('error: ', err)
        throw err
    }
)
