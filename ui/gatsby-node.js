let env = process.env.CI ? 'development' : process.env.NODE_ENV
require('dotenv').config({
  path: `.env.${env}`,
})

const categories = require('./src/data/categories.json')

exports.createPages = ({ page, actions }) => {
  const { createPage } = actions

  categories.forEach(category => {
    createPage({
      path: `/category/${category.slug}`,
      component: require.resolve('./src/templates/category.js'),
      context: category,
    })

    if (category.subcategories) {
      category.subcategories.forEach(subcategory => {
        createPage({
          path: `/category/${subcategory.slug}`,
          component: require.resolve('./src/templates/category.js'),
          context: subcategory,
        })
      })
    }
  })
}

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions
  // set up a client-side route
  if (page.path.match(/^\/projects\/edit\//)) {
    page.matchPath = '/edit/*'
    createPage(page)
  }

  if (page.path.match(/^\/project\//)) {
    page.matchPath = '/project/*'
    createPage(page)
  }

  if (page.path.match(/^\/profile\//)) {
    page.matchPath = '/profile/*'
    createPage(page)
  }
}

exports.onCreateWebpackConfig = ({ stage, loaders, actions }) => {
  if (stage === 'build-html') {
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
    node: { fs: 'empty', net: 'empty', child_process: 'empty' },
  })
}
