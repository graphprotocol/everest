const { fetch } = require('cross-undici-fetch')

const activeEnv =
  process.env.GATSBY_ACTIVE_ENV || process.env.NODE_ENV || 'development'

console.log(`Using environment config: '${activeEnv}'`)

require('dotenv').config({
  path: `.env.${activeEnv}`,
})

exports.createPages = async ({ page, actions }) => {
  const { createPage } = actions

  const query = /* GraphQL */ `
    {
      categories {
        id
        name
        imageUrl
        description
        subcategories {
          id
          projects {
            id
          }
        }
        parentCategory {
          id
          name
        }
        projects {
          id
        }
      }
    }
  `

  const result = await fetch(process.env.GATSBY_GRAPHQL_HTTP_URI, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      query: query,
    }),
  })

  const resultData = await result.json()
  if (resultData && resultData.data) {
    let categories = resultData.data.categories || []
    categories.forEach(category => {
      if (category.imageUrl.includes('https://api.thegraph.com/ipfs/api/v0/')) {
        category.imageUrl = category.imageUrl.replace('https://api.thegraph.com/ipfs/api/v0/', 'https://ipfs.everest.link/')
      }
      createPage({
        path: `/category/${category.id}/`,
        component: require.resolve('./src/templates/category.js'),
        context: category,
      })

      if (category.subcategories) {
        category.subcategories.forEach(subcategory => {
          createPage({
            path: `/category/${subcategory.id}/`,
            component: require.resolve('./src/templates/category.js'),
            context: subcategory,
          })
        })
      }
    })
  }
}

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions
  // set up a client-side route
  if (page.path.match(/^\/projects\/edit\//)) {
    page.matchPath = '/projects/edit/*'
    createPage(page)
  }

  if (page.path.match(/^\/project\/template\//)) {
    page.matchPath = '/project/*'
    createPage(page)
  }

  if (page.path.match(/^\/profile\//)) {
    page.matchPath = '/profile/*'
    createPage(page)
  }
}

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'develop-html' || stage === 'build-html') {
    actions.setWebpackConfig({
      module: {
        rules: [
          {
            test: /3box/,
            use: loaders.null(),
          },
        ],
      },
    })
  }

  actions.setWebpackConfig({
    resolve: {
      alias: {
        'cross-undici-fetch': require.resolve(
          'cross-undici-fetch/dist/global-ponyfill.js',
        ),
      },
    },
    node: { fs: 'empty', net: 'empty', child_process: 'empty' },
    module: {
      rules: [
        {
          test: /\.mjs$/,
          include: /node_modules/,
          type: 'javascript/auto',
        },
      ],
    },
  })
}
