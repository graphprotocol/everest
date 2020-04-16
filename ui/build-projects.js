#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const child_process = require('child_process')
const fetch = require('isomorphic-fetch')

function bail(msg) {
  throw new Error(msg)
}

const TEXTILE_BUCKET =
  process.env.TEXTILE_BUCKET || bail('TEXTILE_BUCKET is not defined')

const SUBGRAPH_NAME = process.env.SUBGRAPH_NAME || 'graphprotocol/everest'

let state = {
  assetsUploaded: false,
  lastUpdatedAt: 0,
  queuedProjects: [],
}

async function getLatestProjects(updatedAt) {
  const query = `{ 
    projects(
      first: 1000
      where: { updatedAt_gt: ${updatedAt} }
      orderBy: updatedAt
      orderDirection: desc
    ) { 
      id 
      name 
      description 
      avatar 
      updatedAt
    } 
  }`

  let projects

  await fetch(`https://api.thegraph.com/subgraphs/name/${SUBGRAPH_NAME}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
    }),
  })
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
  console.log(
    `Generate page for project ${project.name} (updated at: ${project.updatedAt})`,
  )

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
      data = replaceTags(data, oldTags[tag], newTags[tag])
    })
    fs.writeFileSync(projectFileName, data)
  }
}

async function deployProjectPages() {
  console.log('Deploying project pages from public/ to textile')
  console.log(
    state.assetsUploaded
      ? 'Assets have already been uploaded, just deploying project pages'
      : "Assets haven't been uploaded yet, deploying everything",
  )

  const { error } = await child_process.spawnSync(
    'textile',

    // Upload everything if the assets haven't been uploaded yet;
    // if they have, just upload the project pages
    !state.assetsUploaded
      ? ['--debug', 'bucket', 'push', 'public/', `${TEXTILE_BUCKET}/`]
      : [
          '--debug',
          'bucket',
          'push',
          'public/project/',
          `${TEXTILE_BUCKET}/project/`,
        ],
    {
      input: '\n',
      encoding: 'utf-8',
      stdio: ['pipe', 'inherit', 'inherit'],
    },
  )
  if (error) {
    throw error
  }

  // Mark the assets as uploaded
  state.assetsUploaded = true
}

async function updateCloudflareDNS() {
  console.log(`Update Cloudflare DNS`)

  let cloudflareToken =
    process.env.CLOUDFLARE_TOKEN || bail('CLOUDFLARE_TOKEN not defined')
  let cloudflareZoneId =
    process.env.CLOUDFLARE_ZONE_ID || bail('CLOUDFLARE_ZONE_ID not defined')
  let recordName =
    process.env.CLOUDFLARE_RECORD_NAME ||
    bail('CLOUDFLARE_RECORD_NAME not defined')
  let recordDomain =
    process.env.CLOUDFLARE_RECORD_DOMAIN ||
    bail('CLOUDFLARE_RECORD_DOMAIN not defined')

  // Fetch current DNS record information
  console.log(`Fetch Cloudflare DNS record`)
  let getResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records?name=${recordName}.${recordDomain}`,
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cloudflareToken}`,
      },
    },
  )
  let dnsData = await getResponse.json()
  let record = dnsData.result[0]
  console.log(`Cloudflare DNS record: ${record.id} (${record.content})`)

  // Identify the current bucket info from Textile
  let { stdout } = await child_process.spawnSync('textile', ['buckets', 'ls'], {
    encoding: 'utf-8',
  })
  let buckets = stdout
    .split('\n')
    .map(line => line.split('\t'))
    .map(entry => entry.map(col => col.trim()))
  let bucket = buckets.find(bucket => bucket[0] === TEXTILE_BUCKET)
  let dnsLink = bucket[4]

  console.log(`Textile bucket info: ${JSON.stringify(bucket)}`)

  // Update DNS record to the current IPFS hash
  console.log(`Set DNS record to ${dnsLink}`)
  let updateResponse = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records/${record.id}`,
    {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${cloudflareToken}`,
      },
      body: JSON.stringify({
        type: 'TXT',
        name: `${recordName}.${recordDomain}`,
        content: `dnslink=${dnsLink}`,
        ttl: 120,
      }),
    },
  )
  await updateResponse.json()
  console.log(`DNS record updated successfully`)
}

async function fetchProjectsLoop() {
  console.log(`Polling for new project updates`)

  const projects = await getLatestProjects(state.lastUpdatedAt)

  if (projects && projects.length > 0) {
    console.log(`Adding ${projects.length} projects to the queue`)

    // queue new projects
    state.queuedProjects.push(...projects)

    // get the most recent updatedAt time in the list
    state.lastUpdatedAt = projects[0].updatedAt
  }

  // poll projects again every 5 seconds
  return setTimeout(fetchProjectsLoop, 5000)
}

async function buildAndDeployProjectsLoop() {
  console.log('Build and deploy project pages')

  // guard against building and deploying pages multiple times in parallel
  if (state.queuedProjects.length > 0) {
    let projects = [...state.queuedProjects]

    console.log(`Building ${projects.length} queued project pages`)

    // generate pages for all queued projects
    const oldContent = getOldContent()
    projects.forEach(project => {
      generateProjectPage(project, oldContent)
    })

    try {
      await deployProjectPages()

      // only keep project updates in the queue that we didn't just regenerate and deploy
      state.queuedProjects = state.queuedProjects.filter(
        queuedProject =>
          projects.find(
            updatedProject =>
              JSON.stringify(updatedProject) === JSON.stringify(queuedProject),
          ) === undefined,
      )

      console.log(`Deployed project pages`)

      // Only update DNS after pushing to the production everest bucket
      if (TEXTILE_BUCKET === 'everest') {
        try {
          await updateCloudflareDNS()
        } catch (e) {
          console.error(`Failed to updated Cloudflare DNS: ${e}`)
        }
      }
    } catch (e) {
      console.error(`Deploying project pages failed: ${e}`)
    }
    console.log(`${state.queuedProjects.length} projects still in the queue`)
  }

  // check if there are queued projects again in 5s
  return setTimeout(buildAndDeployProjectsLoop, 5000)
}

fetchProjectsLoop()
buildAndDeployProjectsLoop()
