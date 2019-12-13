const categories = require('./src/data/categories.json')

exports.createPages = ({ page, actions }) => {
  const { createPage } = actions

  categories.forEach(category => {
    createPage({
      path: `/category/${category.slug}`,
      component: require.resolve('./src/templates/category.js'),
      context: category
    })

    if (category.subcategories) {
      category.subcategories.forEach(subcategory => {
        createPage({
          path: `/category/${subcategory.slug}`,
          component: require.resolve('./src/templates/category.js'),
          context: subcategory
        })
      })
    }
  })
}

exports.onCreatePage = async ({ page, actions }) => {
  const { createPage } = actions
  // set up a client-side route
  if (page.path.match(/^\/project\//)) {
    page.matchPath = '/project/*'
    createPage(page)
  }
}
