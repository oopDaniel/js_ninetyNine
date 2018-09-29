const path = require('path')
const resolve = (dir) => path.join(__dirname, '..', dir)

module.exports = function (config) {
  config.set({
    browsers: ['ChromeHeadlessNoSandbox'],
    frameworks: ['mocha', 'sinon-chai'],
    reporters: ['spec'],
    preprocessors: {
      './index.js': ['webpack']
    },
    files: ['./index.js'],
    webpack: {
      mode: 'development',
      module: {
        rules: [
          {
            test: /\.js$/,
            loader: 'babel-loader',
            include: [ resolve('src'), resolve('test') ]
          }
        ]
      }
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  })
}
