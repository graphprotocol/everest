module.exports = {
  presets: [
    [
      'babel-preset-gatsby',
      {
        targets: {
          node: process.versions.node.split('.')[0],
          browsers: ['>0.25%', 'not dead'],
        },
      },
    ],
  ],
}
