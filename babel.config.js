// Only exists for eslint support
module.exports = {
  presets: [
    '@babel/preset-react',
    [
      '@babel/preset-env',
      {
        targets: { node: true },
        useBuiltIns: false,
        ignoreBrowserslistConfig: true,
      },
    ],
  ],
  plugins: [
    '@babel/plugin-proposal-async-generator-functions',
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-optional-catch-binding',
  ],
  ignore: ['node_modules'],
};
