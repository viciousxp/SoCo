var winston = require('winston')
  , path = require('path')
  , mkdirp = require('mkdirp')
  , rootDir = path.dirname(require.main.filename) + '/etc/logs/';


mkdirp(rootDir, function (err) {
    if (err) throw err;
});

var config = {
  levels: {
    verbose: 0,
    info: 1,
    data: 2,
    warn: 3,
    debug: 4,
    error: 5
  },
  colors: {
    verbose: 'cyan',
    info: 'green',
    data: 'grey',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
  }
};

var Logger = module.exports = new (winston.Logger)({
  transports: [
    new (winston.transports.Console)({
      colorize: true
    }),
    new (winston.transports.File)({
      name: 'file#verbose',
      level: 'verbose',
      filename: rootDir + '/all.log'
    }),
    new (winston.transports.File)({
      name: 'file#info',
      level: 'info',
      filename: rootDir + '/info.log'
    }),
    new (winston.transports.File)({
      name: 'file#data',
      level: 'data',
      filename: rootDir + '/data.log'
    }),
    new (winston.transports.File)({
      name: 'file#warn',
      level: 'warn',
      filename: rootDir + '/warn.log'
    }),
    new (winston.transports.File)({
      name: 'file#debug',
      level: 'debug',
      filename: rootDir + '/debug.log'
    }),
    new (winston.transports.File)({
      name: 'file#error',
      level: 'error',
      filename: rootDir + '/error.log'
    })
  ],
  levels: config.levels,
  colors: config.colors
});

Logger.data('App initiated at: ' + new Date());