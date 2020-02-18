const path = require("path");

module.exports = {
  entry: {
    app: "./src/index.ts"
  },
  output: {
    filename: "index.js",
    path: path.resolve(__dirname, "bundle"),
    globalObject: "this",
    libraryTarget: "commonjs"
  },
  target: "node",
  mode: "development",
  module: {
    rules: [
      // note that babel-loader is configured to run after ts-loader
      {
        test: /\.(ts)$/,
        include: path.resolve(__dirname, "./src"),
        use: [
          {
            loader: "babel-loader",
            options: {
              presets: [
                ["@babel/preset-env", { forceAllTransforms: true }]
              ],
              plugins: ["add-module-exports"]
            }
          },
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                outDir: path.resolve(__dirname, "bundle")
              }
            }
          }
        ]
      }
    ]
  }
};
