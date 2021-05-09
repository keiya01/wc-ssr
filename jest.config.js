module.exports = {
  clearMocks: true,
  coverageDirectory: "coverage",
  coveragePathIgnorePatterns: ["/node_modules/"],
  coverageProvider: "v8",
  moduleFileExtensions: ["js", "json", "jsx", "ts", "tsx", "node"],
  transform: {
    "\\.[jt]s$": "babel-jest",
  },
  transformIgnorePatterns: ["/node_modules/"],
  preset: "jest-puppeteer",
};
