/**
 * Configure your Gatsby site with this file.
 *
 * See: https://www.gatsbyjs.org/docs/gatsby-config/
 */
let env = process.env.CI ? 'development' : process.env.NODE_ENV
require('dotenv').config({
  path: `.env.${env}`,
})

module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-theme-ui',
      options: {
        stylesProvider: {
          injectFirst: true,
        },
      },
    },
    {
      resolve: 'gatsby-source-graphql',
      options: {
        // This type will contain remote schema Query type
        typeName: 'everest',
        // This is the field under which it's accessible
        fieldName: 'everest',
        // URL to query from
        url: 'https://eu1.prisma.sh/nevena-djaja/ui-mocks/dev',
      },
    },
    {
      resolve: 'gatsby-source-filesystem',
      options: {
        name: 'images',
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: 'gatsby-plugin-react-svg',
    },
    {
      resolve: `gatsby-plugin-prefetch-google-fonts`,
      options: {
        fonts: [
          {
            family: 'Space Mono',
            variants: ['400', '400i', '700', '700i'],
          },
        ],
      },
    },
    {
      resolve: 'gatsby-plugin-eslint',
      options: {
        test: /\.js$|\.jsx$/,
        exclude: /(node_modules|.cache|public|dist)/,
        stages: ['develop'],
        options: {
          emitWarning: true,
          failOnError: false,
          failOnWarning: false,
        },
        parserOptions: {
          ecmaFeatures: {
            jsx: true,
            modules: true,
          },
        },
      },
    },
  ],
  siteMetadata: {
    title: 'Everest',
    titleTemplate: '%s · Everest',
    description: 'Repository of crypto projects',
    url: 'http://test22.eth', // No trailing slash allowed!
    image: '', // Path to your image you placed in the 'static' folder
    twitterUsername: '@graphprotocol',
  },
}
