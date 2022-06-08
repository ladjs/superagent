const fs = require('fs');
const path = require('path');
const package = require('../package.json');

const UNSUPPORT_DEPS_4_OLD = new Set([
  '@commitlint/cli',
  '@commitlint/config-conventional',
  'eslint',
  'eslint-config-xo-lass',
  'eslint-plugin-compat',
  'eslint-plugin-node',
  'husky',
  'lint-staged',
  'remark-cli',
  'remark-preset-github',
  'xo'
]);

for (const item in package.devDependencies) {
  if (UNSUPPORT_DEPS_4_OLD.has(item)) {
    package.devDependencies[item] = undefined;
  }
}

fs.writeFileSync(
  path.join(__dirname, '../package.json'),
  JSON.stringify(package, null, 2)
);
