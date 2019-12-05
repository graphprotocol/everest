/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */

module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-theme-ui',
    'gatsby-plugin-styled-components',
    {
      resolve: 'gatsby-source-graphql',
      options: {
        // This type will contain remote schema Query type
        typeName: 'everest',
        // This is the field under which it's accessible
        fieldName: 'everest',
        // URL to query from
        url: 'https://eu1.prisma.sh/nevena-djaja/ui-mocks/dev'
      }
    },
    {
      resolve: 'gatsby-plugin-react-svg'
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`
      }
    }
  ],
  siteMetadata: {
    title: 'Everest',
    titleTemplate: '%s · Everest',
    description: 'Repository of crypto projects',
    url: 'http://test22.eth', // No trailing slash allowed!
    image: '', // Path to your image you placed in the 'static' folder
    twitterUsername: '@graphprotocol'
  }
}
