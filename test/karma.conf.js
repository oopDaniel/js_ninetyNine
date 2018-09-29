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
      mode: 'development'
    },
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    }
  })
}
