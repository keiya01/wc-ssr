const path = require("path");
const webpack = require("webpack");
const common = require("./webpack.config");

module.exports = {
  ...common,
  target: "node",
  entry: path.resolve("./server/index.ts"),
  output: {
    path: path.resolve("dist", "server"),
    filename: "[name].bundle.js",
  },
  plugins: [
    ...common.plugins,
    new webpack.IgnorePlugin({
      resourceRegExp: /.\/element$/,
    }),
  ],
};
