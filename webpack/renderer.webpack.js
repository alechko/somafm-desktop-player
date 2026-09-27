// Native module loaders inject Node globals (__dirname) and only belong in the main process
const rules = require('./rules.webpack').filter(
  rule => !String(rule.test).includes('node')
)

module.exports = {
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  module: {
    rules,
  },
}
