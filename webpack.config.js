const path = require('path');
const fs = require('fs');

const ClientPagesPath = './client/pages';

const isProd = process.env.NODE_ENV === 'production';

const recursivePages = (pages, filePath, pageName) => {
  const absPath = path.resolve(pageName ? `${filePath}/${pageName}` : filePath);
  const dirs = fs.readdirSync(absPath);
  dirs.map((name) => {
    const relativePath = pageName ? `${pageName}/${name}` : name;
    if(fs.lstatSync(`${absPath}/${name}`).isDirectory()) {
      recursivePages(pages, filePath, relativePath);
    }
    if(fs.lstatSync(`${absPath}/${name}`).isFile()) {
      pages.push(relativePath);
    }
  });
  return pages;
};

const pages = recursivePages([], ClientPagesPath);
const entry = pages.reduce((res, pageName) => {
  return { ...res, [pageName.split('.')[0]]: path.resolve(ClientPagesPath, pageName) }
}, {});

module.exports = {
  mode: isProd ? 'production' : 'development',
  entry,
  output: {
    path: path.resolve('dist'),
    filename: '[name].bundle.js'
  },
  module: {
    rules: [
      {
        test: /\.ts(x)?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: 'tsconfig.client.json',
            }
          },
        ]
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
};
