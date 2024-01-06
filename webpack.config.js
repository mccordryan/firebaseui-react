const path = require("path");

module.exports = {
  mode: "development",
  entry: "./src/index.js", // Entry point for your library
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: "ReactFirebaseUI",
    libraryTarget: "umd",
    // globalObject: "this"
  },
  externals: {
    react: "react",
    firebase: "firebase",
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        include: [path.resolve(__dirname, "src")],
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
