//==================================================
// DHT Sensor (Temperature & Humidity) from RPi GPIO
//==================================================
// use metric.variable from client config to select which data is needed 
/*
TEMPLATE EXAMPLE:
{
	"plugins": [{
		"source": "metrics",
		"name": "metrics",
		"interval": 60,
		"metrics": [{
				"name": "temperature",
				"source": "dht",
				"variable": "temperature",
				"type": "gauge",
				"labels": [{
					"temperature": "true"
				}]
			},
			{
				"name": "humidity",
				"source": "dht",
				"variable": "humidity",
				"type": "gauge",
				"labels": [{
					"humidity": "true"
				}]
			}
		],
		"status": {
			"date": "",
			"message": ""
		}
	}]
}
*/
var sensor = require("node-dht-sensor");
module.exports = {
    run: function(metric, callback){
        sensor.read(11, 4, function(err, temperature, humidity) {
            metric.value = 0;
            if (!err) {
              if (metric.variable === "temperature"){
                metric.value = temperature;
              } else if (metric.variable === "humidity"){
                metric.value = humidity;
              }
            }
        });
        return callback(metric);
    }
}