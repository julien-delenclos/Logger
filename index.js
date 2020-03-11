"use strict";

var _winston = _interopRequireDefault(require("winston"));

var _moment = _interopRequireDefault(require("moment"));

var _path = _interopRequireDefault(require("path"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var Logger = /*#__PURE__*/function () {
  function Logger() {
    var _this = this;

    _classCallCheck(this, Logger);

    this.config = {
      level: 'info',
      directory: './log',
      maxSize: 50 * 1024 * 1024,
      maxFiles: 3,
      logDebug: false,
      logInConsole: true,
      logStream: 'App.log',
      init: false
    };
    this.processid = process.env.pm_id || -1;
    this.stackSeparator = "\n";

    this.getErrorStack = function (error) {
      return error ? _this.getStack(error, 1) : _this.getStack(new Error(), 3, 1);
    };
  }

  _createClass(Logger, [{
    key: "init",
    value: function init(config) {
      Object.assign(this.config, config);
      this.config.init = true;
      this.logger = this.getLogger(this.config.logStream);
      this.loggerDebug = this.getLogger(this.config.logStream.replace(".log", "_debug.log"));
    }
  }, {
    key: "getLogger",
    value: function getLogger(fileName) {
      _fs["default"].mkdir(_path["default"].dirname(_path["default"].join(this.config.directory, fileName)), {
        recursive: true
      }, function (err) {
        return err && console.error(err);
      });

      var winstonLogger = new _winston["default"].Logger({
        transports: [new _winston["default"].transports.File({
          level: this.config.level,
          filename: _path["default"].join(this.config.directory, fileName),
          handleExceptions: true,
          json: false,
          timestamp: function timestamp() {
            return (0, _moment["default"])().format("YYYY-MM-DD HH:mm:ss,SSS");
          },
          formatter: function formatter(options) {
            return options.timestamp() + "\t[" + options.level.toUpperCase() + "]\t" + (options.message ? options.message : "") + (options.meta && Object.keys(options.meta).length ? "\n\t" + JSON.stringify(options.meta) : "");
          },
          maxsize: this.config.maxSize,
          maxFiles: this.config.maxFiles,
          colorize: false
        })],
        exitOnError: false
      });

      if (this.config.logInConsole) {
        winstonLogger.add(_winston["default"].transports.Console, {
          name: "console-log",
          level: "debug",
          handleExceptions: true,
          json: false,
          colorize: true
        });
      }

      return winstonLogger;
    }
  }, {
    key: "log",
    value: function log(level, message, error, debugInfo) {
      try {
        if (!this.config.init) throw new Error('call Logger.init before use it');

        if (debugInfo && this.config.logDebug) {
          message = JSON.stringify(message, null, "\t");
          this.loggerDebug[level]("[nodeId=".concat(this.processid, "]\t").concat(message), error);
        } else if (!debugInfo) {
          this.logger[level]("[nodeId=".concat(this.processid, "]\t").concat(message), error);
        }
      } catch (error) {
        console.log('error', error);
      }
    }
  }, {
    key: "getStack",
    value: function getStack(error, index, count) {
      var splited = error.stack.split(this.stackSeparator);
      var spliced = count ? splited.splice(index, count) : splited.splice(index);
      return spliced.map(function (item) {
        return item.trim();
      }).join(this.stackSeparator);
    }
  }, {
    key: "debug",
    value: function debug(message, error) {
      this.log("debug", message, this.getErrorStack(error));
    }
  }, {
    key: "infoDebug",
    value: function infoDebug(message, error) {
      this.log("info", message, "", true);
    }
  }, {
    key: "info",
    value: function info(message, error) {
      this.log("info", message);
    }
  }, {
    key: "warn",
    value: function warn(message, error) {
      this.log("warn", message);
    }
  }, {
    key: "error",
    value: function error(message, _error) {
      this.log("error", message, this.getErrorStack(_error));
    }
  }, {
    key: "write",
    value: function write(message) {
      this.logger.info(message);
    }
  }], [{
    key: "getInstance",
    value: function getInstance() {
      if (Logger.instance === null) {
        Logger.instance = new Logger();
      }

      return Logger.instance;
    }
  }]);

  return Logger;
}();

Logger.instance = null;
module.exports = Logger.getInstance();
//# sourceMappingURL=index.js.map