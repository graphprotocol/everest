const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const fs = require('fs')
const execa = require('execa')

const app = express()

// Set port to serve at
const PORT = process.env.PORT || 4040
app.set('port', PORT)
app.use(bodyParser.json())

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

// Endpont for POST request
// move the script.js logic in here
app.post('/api/project/create', (req, res) => {
  console.log('REQ.BODY: ', req.body)
  const filename = path.join(__dirname, 'public/project', 'index.html')
  const newDir = path.join(__dirname, `public/project/${req.body.projectId}`)
  const newFilename = path.join(
    __dirname,
    `public/project/${req.body.projectId}`,
    'index.html',
  )
  fs.readFile(filename, 'utf8', async (err, data) => {
    if (err) throw err
    if (data) {
      const oldTags = getMetaTags(
        'Everest',
        'Repository of crypto projects',
        'http://test22.eth',
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

      if (!fs.existsSync(newDir)) {
        fs.mkdirSync(newDir)
      }
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
      } catch (error) {
        console.log('ERROR: ', error)
      }
    }
  })
  return res.send('Received a POST HTTP method')
})

// Serve the build files
app.listen(PORT, () => {
  console.log('Server running on PORT ' + PORT)
  console.log('Go to http://localhost:4040/ to serve everest')
})
