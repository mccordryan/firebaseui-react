const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

module.exports = {
  mode: "production",
  // entry: "./src/index.js",
  // entry: path.resolve(__dirname, "example", "src", "index.js"),
  entry: "./example/src/index.js",
  output: {
    path: path.resolve(__dirname, "example", "public"),
    filename: "bundle.js",
    libraryTarget: "umd",
    globalObject: "this",
  },
  // externals: {
  //   react: "react",
  // },
  plugins: [
    new HtmlWebpackPlugin({
      template: "./example/public/index.html",
    }),
  ],
  devServer: {
    static: {
      directory: path.join(__dirname, "example", "public"),
    },
    compress: true,
    port: 8080,
  },
  performance: {
    maxAssetSize: 700000,
    maxEntrypointSize: 700000,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
    ],
  },
  resolve: {
    extensions: [".js", ".jsx"],
  },
};
