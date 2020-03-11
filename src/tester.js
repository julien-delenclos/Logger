const logger = require('../index')

logger.init({
  level: 'error',
  directory: './log',
  maxSize: 50 * 1024 * 1024,
  maxFiles: 3,
  logDebug: true,
  logInConsole: true,
  logStream: 'LogApp.log'
})

logger.info('info')
logger.debug('debug')
logger.warn('warn')
logger.error('error')
logger.infoDebug('infoDebug')