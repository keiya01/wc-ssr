module.exports = (api) => {
  api.cache(true);

  const presets = [
    ["@babel/preset-typescript", { parerOpts: { module: "esnext" } }],
    ["@babel/preset-env", { targets: { chrome: 83 } }],
  ];

  const plugins = [];

  return {
    presets,
    plugins,
  };
};
