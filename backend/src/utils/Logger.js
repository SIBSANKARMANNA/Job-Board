// const winston =
//  require('winston');

// module.exports =
// winston.createLogger({
//  level:'info',
//  transports:[
//    new winston.transports.Console()
//  ]
// });


const winston = require('winston');

module.exports = winston.createLogger({
  level: 'debug',
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console()
  ]
});