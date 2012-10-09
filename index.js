if (typeof window != 'undefined') {
  module.exports = require('./lib/superagent');
} else if (process.env.SUPERAGENT_COV) {
  module.exports = require('./lib-cov/node');
} else {
  module.exports = require('./lib/node');
}
