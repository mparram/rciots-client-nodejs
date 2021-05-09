//========================
// GPS Server (Deprecated)
//========================
const gpsd = require('node-gpsd');
console.log("start gps-server");
const daemon = new gpsd.Daemon({
  program: 'gpsd',
  device: '/dev/ttyUSB0',
  port: 2947,
  pid: '/tmp/gpsd.pid',
  readOnly: false,
  logger: {
    info: function() {},
    warn: console.warn,
    error: console.error
  }
});
daemon.start(() => {
  console.log('GPS Daemon started');
});
