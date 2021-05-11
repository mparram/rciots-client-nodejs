//======================
// Docker-compose Plugin
//======================
// Will run the composefile in Podman or Docker
/*
TEMPLATE EXAMPLE:
{
	"plugins": [{
		"source": "dockercompose",
		"name": "quarkus-getting-started",
		"composefile": "version: '3.7'\nservices:\n  quarkus:\n    image: quay.io/abattagl/quarkus-getting-started:1-aarch64\n    restart: always\n    volumes:\n        - volume_quarkus:/data\n    ports:\n        - 8090:8080\nvolumes:\n    volume_quarkus:",
		"env": {
			"quarkus": {
				"TEST_ENV": "HELLO_WORLD"
			}
		},
		"status": {
			"date": "",
			"message": ""
		}
	}]
}
*/
var dcompose = require("docker-compose");
module.exports = {
    run: function(plugin, callback){
        dcompose.upAll({ configAsString: plugin.composefile, log: true }).then(
            () => {
              console.log('all services are running!')
              plugin.status.date = new Date();
              plugin.status.message = 'all services are running!';
              return callback(plugin);
            },
            (err) => {
                console.log(plugin.composefile);
                plugin.status.date = new Date();
                plugin.status.message = 'something went wrong:', err.message;
                console.log('something went wrong:', err.message);
                return callback(plugin);
            }
        ) 
    }
}