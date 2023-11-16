const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js", // Entry point for your library
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "index.js",
    library: "ReactFirebaseUI",
    libraryTarget: "umd",
    globalObject: "this",
  },
  externals: {
    react: "React",
    "react-dom": "ReactDOM",
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
