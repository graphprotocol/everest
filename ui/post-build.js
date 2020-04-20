const fs = require('fs')
const path = require('path')
const fetch = require('isomorphic-fetch')

const filename = path.join(__dirname, 'public/project/template', 'index.html')
const SUBGRAPH_NAME =
  process.env.SUBGRAPH_NAME || 'graphprotocol/everest-ropsten'

let contents
if (filename) {
  contents = fs.readFileSync(filename, 'utf8')
}

function getMetaTags(title, description, image, url) {
  const tags = {
    title: `<title data-react-helmet="true">${title}</title>`,
    titleMeta: `<meta data-react-helmet="true" name="title" content="${title}"/>`,
    titleOg: `<meta data-react-helmet="true" property="og:title" content="${title}"/>`,
    titleTwitter: `<meta data-react-helmet="true" name="twitter:title" content="${title}"/>`,
    description: `<meta data-react-helmet="true" name="description" content="${description}"/>`,
    descriptionOg: `<meta data-react-helmet="true" property="og:description" content="${description}"/>`,
    descriptionTwitter: `<meta data-react-helmet="true" name="twitter:description" content="${description}"/>`,
    image: `<meta data-react-helmet="true" name="image" content="${image}"/>`,
    imageOg: `<meta data-react-helmet="true" property="og:image" content="${image}"/>`,
    imageTwitter: `<meta data-react-helmet="true" name="twitter:image" content="${image}"/>`,
    url: `<meta data-react-helmet="true" property="og:url" content="${url}"/>`,
  }
  return tags
}

function replaceTags(text, oldTag, newTag) {
  return text.replace(oldTag, newTag)
}

fetch(`https://api.thegraph.com/subgraphs/name/${SUBGRAPH_NAME}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: '{ projects { id name description avatar } }',
  }),
})
  .then(res => {
    return res.json()
  })
  .then(res => {
    if (res && res.data) {
      if (res.data.projects && res.data.projects.length > 0) {
        res.data.projects.forEach(project => {
          let newDir = path.join(__dirname, `public/project/${project.id}`)
          let newFilename = path.join(
            __dirname,
            `public/project/${project.id}`,
            'index.html',
          )
          if (!fs.existsSync(newDir)) {
            fs.mkdirSync(newDir)
          }

          if (contents) {
            let newData = contents
            const oldTags = getMetaTags(
              'Everest',
              'A shared registry of crypto projects curated by its members.',
              'https://everest.link/mountain.jpg',
              'https://everest.link/',
            )
            const newTags = getMetaTags(
              project.name,
              project.description,
              `https://api.thegraph.com/ipfs/api/v0/cat?arg=${project.avatar}`,
              `https://everest.link/project/${project.id}`,
            )
            Object.keys(oldTags).forEach(function(tag) {
              newData = replaceTags(newData, oldTags[tag], newTags[tag])
            })
            fs.writeFileSync(newFilename, newData)
          }
        })
      }
    }
  })
