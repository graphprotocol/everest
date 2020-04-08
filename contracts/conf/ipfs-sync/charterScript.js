// creates the ipfs hash based on the charter file

const fs = require('fs')
const { exec } = require('child_process')

const pinToIPFS = async () => {
    await exec(`ipfs add ${__dirname}/../../../ui/src/data/charter.js`, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`IPFS hash: ${stdout}`)
            const ipfsHash = stdout.split(' ')
            fs.writeFileSync(`${__dirname}/charter.txt`, ipfsHash[1])
            console.log(`stderr: ${stderr}`)
        }
    })

    await exec(
        `ipfs-sync sync-files --from http://localhost:5001/ --to https://api.staging.thegraph.com/ipfs/ --file-list ${__dirname}/charter.txt`,
        (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(err)
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`Sync to staging: ${stdout}`)
                console.log(`stderr: ${stderr}`)
            }
        }
    )

    await exec(
        `ipfs-sync sync-files --from http://localhost:5001/ --to https://api.thegraph.com/ipfs/ --file-list ${__dirname}/charter.txt`,
        (err, stdout, stderr) => {
            if (err) {
                //some err occurred
                console.error(err)
            } else {
                // the *entire* stdout and stderr (buffered)
                console.log(`Sync to main: ${stdout}`)
                console.log(`stderr: ${stderr}`)
            }
        }
    )
}

pinToIPFS()
