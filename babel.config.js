module.exports = (api) => {
  const IS_SERVER = api.caller((caller) => caller && caller.target === 'node');

  const presets = [
    ["@babel/preset-typescript", { parerOpts: { module: IS_SERVER ? 'commonjs' : 'esnext' } }]
  ];

  const plugins = [];
  if(IS_SERVER) {
    plugins.push(["babel-plugin-transform-remove-imports", {
      "test": "element$"
    }]);
  }

  return {
    presets,
    plugins,
  };
}
