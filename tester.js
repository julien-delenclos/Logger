const {Logger} = require('./build/index')

Logger.init({
  level: 'error',
  directory: './log',
  maxSize: 50 * 1024 * 1024,
  maxFiles: 3,
  logDebug: true,
  logInConsole: true,
  logStream: 'LogApp.log'
})

Logger.info('info')
Logger.debug('debug')
Logger.warn('warn')
Logger.error('error')
Logger.infoDebug('infoDebug')