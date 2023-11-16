const fs = require('fs')
const { exec } = require('child_process')

const ids = require('./raw-category-data/ids.json')
const ipfsHashes = require('./raw-category-data/image-hashes.json')
const names = require('./raw-category-data/names.json')
const descriptions = require('./raw-category-data/descriptions.json')
const parents = require('./raw-category-data/parents.json')

let categories = []
let categoryCount = Object.keys(ids).length

for (let i = 0; i < categoryCount; i++) {
    let category = {}
    let key = Object.keys(ids)[i]
    category.id = ids[key]
    category.imageHash = ipfsHashes[key]
    category.imageUrl = 'https://ipfs.everest.link/cat?arg=' + ipfsHashes[key]
    category.name = names[key]
    category.slug = key
    category.description = descriptions[key]
    category.parent = parents[key]

    categories[i] = category
}

console.log(categories)
console.log(`${categoryCount} categories created`)

const storeData = (data, path) => {
    try {
        fs.writeFileSync(path, JSON.stringify(data, null, 4))
    } catch (err) {
        console.error(err)
    }
}

// Store final categories json file. This autogenerated file is used for Everest
storeData(categories, __dirname + '/../categories.json')

const pinToIPFS = async () => {
    await exec(`ipfs add ${__dirname}/../categories.json`, (err, stdout, stderr) => {
        if (err) {
            //some err occurred
            console.error(err)
        } else {
            // the *entire* stdout and stderr (buffered)
            console.log(`IPFS hash: ${stdout}`)
            const ipfsHash = stdout.split(' ')
            fs.writeFileSync(`${__dirname}/../ipfs-sync/categories.txt`, ipfsHash[1])
            console.log(`stderr: ${stderr}`)
        }
    })

    await exec(
        `ipfs-sync sync-files --from http://localhost:5001/ --to https://ipfs.everest.link/ --file-list ${__dirname}/../ipfs-sync/categories.txt`,
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
        `ipfs-sync sync-files --from http://localhost:5001/ --to https://ipfs.everest.link/ --file-list ${__dirname}/../ipfs-sync/categories.txt`,
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
