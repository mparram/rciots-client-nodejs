//===================================================
// Metrics - intended to run loops from other sources
//===================================================
// It will use the interval to run every X seconds and obtain the metrics value from other sources (dht, gps, dummy, ...). TBD what to do with it later.
// For the moment, app.js will push every update with WebSockets to device-manager if enableWSEmit = true

module.exports = {
    run: function(plugin, callback){
        if (plugin.interval > 0){
            var metrics = [];
            setInterval(() => {
                plugin.metrics.forEach(function getmetrics(metric, x) {
                    var metricfile = require("./" + metric.source + ".js");
                    metricfile.run(metric, function(){
                        metrics[x].value = metric.value; 
                    })
                });
                plugin.status.date = new Date();
                var message = "";
                metrics.forEach(metric => {
                    message += metric.name + ":" + metric.value + ";";
                });
                plugin.status.message = message.slice(0,-1);
                return callback(plugin);
            }, plugin.interval * 1000);
        }
        plugin.metrics.forEach(function getmetrics(metric, x) {
            var metricfile = require("./" + metric.source + ".js");
            metricfile.run(metric, function(){
                metrics.push(metric); 
            })
        });
        plugin.status.date = new Date();
        var message = "";
        metrics.forEach(metric => {
            message += metric.name + ":" + metric.value + ";";
        });
        plugin.status.message = message.slice(0,-1);
        return callback(plugin);
    }
}