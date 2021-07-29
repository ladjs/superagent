module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        browserslistEnv: process.env.BROWSERSLIST_ENV
      }
    ]
  ],
  sourceMaps: 'inline'
};
