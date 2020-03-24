const fs = require('fs')
const path = require('path')
const execa = require('execa')
const fetch = require('isomorphic-fetch')

async function getLatestProjects(membershipStartTime) {
  const query = `{ 
    projects(
      where: { membershipStartTime_gt: ${membershipStartTime} }, 
      orderBy: membershipStartTime, 
      orderDirection: desc
    ) { 
      id 
      name 
      description 
      avatar 
      membershipStartTime 
    } 
  }`

  let projects

  await fetch(
    'https://api.staging.thegraph.com/subgraphs/name/graphprotocol/everest',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: query,
      }),
    },
  )
    .then(res => {
      return res.json()
    })
    .then(res => {
      projects = res && res.data ? res.data.projects : []
    })
    .catch(e => {
      console.error(`Error with fetching projects: ${e.message}`)
    })

  return projects
}

async function pollAndBuild(startTime) {
  let membershipStartTime = startTime
  const projects = await getLatestProjects(membershipStartTime)
  // only run if there latest projects
  if (projects && projects.length > 0) {
    // get the latest timestamp
    membershipStartTime = projects[0].membershipStartTime
    // execute only if a new project is added since the last poll
    const oldContent = getOldContent()
    projects.forEach(project => {
      generateProjectPage(project, oldContent)
    })
    deployProjectPages()
  }
  // TODO: Queue up projects before you run  Textile
  // Check if the previous shell process finished
  // Bulk upload the projects to Textile
  // poll again every 5 seconds
  return setTimeout(() => pollAndBuild(membershipStartTime), 5000)
}

function getOldContent() {
  const filename = path.join(__dirname, 'public/project', 'index.html')
  let content
  if (filename) {
    content = fs.readFileSync(filename, 'utf8')
  }
  return content
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

function generateProjectPage(project, oldContent) {
  let projectDir = path.join(__dirname, `public/project/${project.id}`)
  let projectFileName = path.join(
    __dirname,
    `public/project/${project.id}`,
    'index.html',
  )
  if (!fs.existsSync(projectDir)) {
    fs.mkdirSync(projectDir)
  }

  if (oldContent) {
    let data = oldContent
    const oldTags = getMetaTags(
      'Everest',
      'Repository of crypto projects',
      'https://everest.link/mountain.jpg',
      'https://everest.link/',
    )
    const newTags = getMetaTags(
      project.name,
      project.description,
      `https://api.staging.thegraph.com/ipfs/api/v0/cat?arg=${project.avatar}`,
      `https://everest.link/project/${project.id}`,
    )
    Object.keys(oldTags).forEach(function(tag) {
      data = replaceTags(data, oldTags[tag], newTags[tag])
    })
    fs.writeFileSync(projectFileName, data)
  }
}

function deployProjectPages() {
  try {
    console.log('Deploying public to textile')
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

pollAndBuild(0)
