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
  pathPrefix: '__GATSBY_IPFS_PATH_PREFIX__',
  plugins: [
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-webpack-bundle-analyser-v2',
    {
      resolve: 'gatsby-plugin-theme-ui',
      options: {
        stylesProvider: {
          injectFirst: true,
        },
      },
    },
    {
      resolve: `gatsby-plugin-layout`,
      options: {
        component: require.resolve(`./src/components/Layout/`),
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
            variants: ['400', '400i', '700', '900', '900i'],
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
    'gatsby-plugin-ipfs',
  ],
  siteMetadata: {
    title: 'Everest',
    description: 'Repository of crypto projects',
    url: 'https://everest.link', // No trailing slash allowed!
    image: '/mountain.jpg', // Path to your image you placed in the 'static' folder
  },
}
