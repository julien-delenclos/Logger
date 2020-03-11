import winston from 'winston'
import moment from 'moment'
import path from 'path'
import fs from 'fs'

class Logger {
  static instance = null
  static getInstance(){
    if(Logger.instance === null){
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  config = {
    level: 'info',
    directory: './log',
    maxSize: 50 * 1024 * 1024,
    maxFiles: 3,
    logDebug: false,
    logInConsole: true,
    logStream: 'App.log',
    init: false
  }

  init(config) {
    Object.assign(this.config, config)
    this.config.init = true
    this.logger = this.getLogger(this.config.logStream)
    this.loggerDebug = this.getLogger(this.config.logStream.replace(".log", "_debug.log"))
  }

  processid = process.env.pm_id || -1
  stackSeparator = "\n"

  getLogger(fileName) {
    fs.mkdir(path.dirname(path.join(this.config.directory, fileName)), { recursive: true }, err => err && console.error(err))
    let winstonLogger = new winston.Logger({
      transports: [
        new winston.transports.File({
          level: this.config.level,
          filename: path.join(this.config.directory, fileName),
          handleExceptions: true,
          json: false,
          timestamp: function() {
            return moment().format("YYYY-MM-DD HH:mm:ss,SSS");
          },
          formatter: function(options) {
            return (
              options.timestamp() +
              "\t[" +
              options.level.toUpperCase() +
              "]\t" +
              (options.message ? options.message : "") +
              (options.meta && Object.keys(options.meta).length ? "\n\t" + JSON.stringify(options.meta) : "")
            );
          },
          maxsize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
          colorize: false
        })
      ],
      exitOnError: false
    })

    if (this.config.logInConsole) {
      winstonLogger.add(winston.transports.Console, {
        name: "console-log",
        level: "debug",
        handleExceptions: true,
        json: false,
        colorize: true
      });
    }

    return winstonLogger
  }

  log(level, message, error, debugInfo) {
    try {
      if(!this.config.init) throw new Error('call Logger.init before use it')
      if (debugInfo && this.config.logDebug) {
        message = JSON.stringify(message, null, "\t")
        this.loggerDebug[level](`[nodeId=${this.processid}]\t${message}`, error)
      }
      else if (!debugInfo) {
        this.logger[level](`[nodeId=${this.processid}]\t${message}`, error)
      }
    } catch (error) {
      console.log('error', error)
    }
  }

  getStack(error, index, count) {
    const splited = error.stack.split(this.stackSeparator)
    const spliced = count ? splited.splice(index, count) : splited.splice(index)
    return spliced.map(item => item.trim()).join(this.stackSeparator)
  }

  getErrorStack = error => error ? this.getStack(error, 1) : this.getStack(new Error(), 3, 1)

  debug(message, error) {
		this.log("debug", message, this.getErrorStack(error))
	}
	infoDebug(message, error) {
		this.log("info", message, "", true)
	}
	info(message, error) {
		this.log("info", message)
	}
	warn(message, error) {
		this.log("warn", message)
	}
	error(message, error) {
		this.log("error", message, this.getErrorStack(error))
	}
	write(message) {
		this.logger.info(message)
	}
}

module.exports = {Logger: Logger.getInstance()}