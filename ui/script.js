const fs = require('fs')
const path = require('path')
const execa = require('execa')

const projectId = '0x3da18463aac062323bcef2d408c2724da3868da1'

const filename = path.join(__dirname, 'public/project', 'index.html')
const newDir = path.join(__dirname, `public/project/${projectId}`)
const newFilename = path.join(
  __dirname,
  `public/project/${projectId}`,
  'index.html',
)

function getMetaTags(title, description, image) {
  const tags = {
    title: '',
    titleOg: `<meta data-react-helmet="true" property="og:title" content="${title}"/>`,
    titleTwitter: `<meta data-react-helmet="true" name="twitter:title" content="${title}"/>`,
    description: `<meta data-react-helmet="true" name="description" content="${description}"/>`,
    descriptionOg: `<meta data-react-helmet="true" property="og:description" content="${description}"/>`,
    descriptionTwitter: `<meta data-react-helmet="true" name="twitter:description" content="${description}"/>`,
    image: `<meta data-react-helmet="true" name="image" content="${image}"/>`,
    imageOg: `<meta data-react-helmet="true" property="og:image" content="${image}"/>`,
    imageTwitter: `<meta data-react-helmet="true" name="twitter:image" content="${image}"/>`,
  }
  return tags
}

function replaceTags(text, oldTag, newTag) {
  return text.replace(oldTag, newTag)
}

fs.readFile(filename, 'utf8', async (err, data) => {
  if (err) throw err
  if (data) {
    const oldTags = getMetaTags(
      'Everest',
      'Repository of crypto projects',
      'http://test22.eth',
    )
    const newTags = getMetaTags('Blah', 'Some Description', 'http://lala.png')
    let newData = data

    Object.keys(oldTags).forEach(function(tag) {
      newData = replaceTags(newData, oldTags[tag], newTags[tag])
    })

    if (!fs.existsSync(newDir)) {
      fs.mkdirSync(newDir)
    }
    fs.writeFileSync(newFilename, newData)

    console.log(`EXECUTING: textile bucket push public/ everest-ui`)

    try {
      const { stdout, stderr } = execa.command(
        'textile --debug bucket push public/ everest-ui',
        {
          input: '\n',
        },
      )
      stdout.pipe(process.stdout)
      stderr.pipe(process.stdout)
    } catch (error) {
      console.log('ERROR: ', error)
    }
  }
})
