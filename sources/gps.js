//==================================================
// GPS - connect to gpsd socket and obtain speed, lat & lon
//==================================================
/*
TEMPLATE EXAMPLE:
{
	"plugins": [{
		"source": "metrics",
		"name": "metrics",
		"interval": 60,
		"metrics": [{
			"name": "gps",
			"source": "gps",
			"variable": "gps",
			"type": "gps",
			"labels": [{
				"gps": "true"
			}]
		}],
		"status": {
			"date": "",
			"message": ""
		}
	}]
}
*/
const gpsd = require('node-gpsd');
module.exports = {
    run: function(metric, callback){
      const listener = new gpsd.Listener({
        port: 2947,
        hostname: 'localhost',
        logger: {
          info: function() {},
          warn: console.lwarn,
          error: console.error
        },
        parse: true
      });
      listener.connect(function(){
        console.log('GPS Listener connected');
        listener.watch();
        listener.on('TPV', (e) => {
          console.log(e);
          console.log(metric);
          if (metric.variable === "lat"){
            metric.value = e.lat;
          } else if (metric.variable === "lon"){
            metric.value = e.lon;
          } else if (metric.variable === "speed"){
            metric.value = e.speed;
          }
          console.log(metric);
          listener.disconnect(function() {
            console.log('GPS Listener disconnected' + JSON.stringify(metric));
            return callback(metric);
          });
        });
      });

    }
}