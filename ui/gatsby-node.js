const categories = require('./src/data/categories.json')

exports.createPages = ({ actions }) => {
  const { createPage } = actions

  categories.forEach(category => {
    createPage({
      path: `/category/${category.slug}`,
      component: require.resolve('./src/templates/category.js'),
      context: category
    })
  })
}
