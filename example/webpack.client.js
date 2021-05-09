const path = require("path");
const common = require("./webpack.config");
const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

// const ClientPagesPath = './pages';

// const recursivePages = (pages, filePath, pageName) => {
//   const absPath = path.resolve(pageName ? `${filePath}/${pageName}` : filePath);
//   const dirs = fs.readdirSync(absPath);
//   dirs.map((name) => {
//     const relativePath = pageName ? `${pageName}/${name}` : name;
//     if(fs.lstatSync(`${absPath}/${name}`).isDirectory()) {
//       recursivePages(pages, filePath, relativePath);
//     }
//     if(fs.lstatSync(`${absPath}/${name}`).isFile()) {
//       pages.push(relativePath);
//     }
//   });
//   return pages;
// };

// const pages = recursivePages([], ClientPagesPath);
// const entry = pages.reduce((res, pageName) => {
//   return { ...res, [pageName.split('.')[0]]: path.resolve(ClientPagesPath, pageName) }
// }, {});

module.exports = {
  ...common,
  entry: path.resolve("./client/app.ts"),
  output: {
    path: path.resolve("dist/client"),
    filename: "[name].bundle.js",
    chunkFilename: "[name].[contenthash].bundle.js",
  },
  module: {
    ...common.module,
    rules: [
      ...common.module.rules,
      {
        test: /\.css$/,
        use: [MiniCssExtractPlugin.loader, "css-loader"],
      },
    ],
  },
  plugins: [
    ...common.plugins,
    new MiniCssExtractPlugin({
      filename: "[name].css",
      chunkFilename: "[id].css",
    }),
    new webpack.DefinePlugin({
      IS_CLIENT: JSON.stringify(true),
    }),
  ],
  optimization: {
    ...(common?.optimization || []),
    minimizer: [
      `...`,
      ...(common?.optimization?.minimizer || []),
      new CssMinimizerPlugin(),
    ],
  },
};
