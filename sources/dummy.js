//=============
// Dummy Metric
//=============
// used for testing, will get a random value [0-100] from the previous value +-[0-20] 
/*
TEMPLATE EXAMPLE:
{
	"plugins": [{
		"source": "metrics",
		"name": "metrics",
		"interval": 60,
		"metrics": [{
            "name": "metric01",
            "source": "dummy",
            "variable": "metricDummy",
            "type": "gauge",
            "labels": [{
                "dummy": "true"
            }]
		}],
        "status": {
            "date": "",
            "message": ""
        }
	}]
}
*/
module.exports = {
    run: function(metric, callback){
        if (!metric.value){
            metric.value = 50;
        }
        if (metric.value < 20) {
            metric.value = 20;
        }else if (metric.value > 80) {
            metric.value = 80;
        }
        metric.value = Math.floor(Math.random() * 40 + metric.value - 20);
        return callback(metric);
    }
}