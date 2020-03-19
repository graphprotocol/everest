const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')
const execa = require('execa')
const cors = require('cors')

const app = express()

// Set port to serve at
const PORT = process.env.PORT || 4040
app.set('port', PORT)
app.use(bodyParser.json())
app.use(cors())

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

app.post('/api/project/build', (req, res) => {
  const filename = path.join(__dirname, 'public/project', 'index.html')
  const newDir = path.join(__dirname, `public/project/${req.body.projectId}`)
  const newFilename = path.join(
    __dirname,
    `public/project/${req.body.projectId}`,
    'index.html',
  )

  let data
  if (filename) {
    data = fs.readFileSync(filename, 'utf8')
  }

  if (!fs.existsSync(newDir)) {
    fs.mkdirSync(newDir)
  }

  const oldTags = getMetaTags(
    'Everest',
    'Repository of crypto projects',
    'https://everest.link/mountain.jpg',
    'https://everest.link/',
  )
  const newTags = getMetaTags(
    req.body.title,
    req.body.description,
    req.body.image,
  )
  let newData = data

  Object.keys(oldTags).forEach(function(tag) {
    newData = replaceTags(newData, oldTags[tag], newTags[tag])
  })

  fs.writeFileSync(newFilename, newData)

  console.log(`EXECUTING: textile bucket push public/ everest-ui`)

  try {
    const { stdout, stderr } = execa.command(
      'textile bucket push public/ everest-ui',
      {
        input: '\n',
      },
    )
    stdout.pipe(process.stdout)
    stderr.pipe(process.stdout)
    setTimeout(function() {
      res.send('ok')
    }, 30000)
  } catch (error) {
    console.log('ERROR: ', error)
    return res.send('error')
  }
})

// Serve the build files
app.listen(PORT, () => {
  console.log('Server running on PORT ' + PORT)
})
