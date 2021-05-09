// client config var
var config;
const fs = require('fs');
// if the config is hardcoded in client, we need to read from a file
var cfgFile = './cfg/clientcfg.json';
var connectionFile = './connection.cfg';
// token = base64 host@token
if ((process.env.RCIOTS_ENDPOINT == undefined) || (process.env.RCIOTS_TOKEN == undefined)){
  if (fs.existsSync(connectionFile)){
    var connection = JSON.parse(fs.readFileSync(connectionFile));
    var token = new Buffer.from(connection.endpoint + "@" + connection.token).toString('base64');
  } else{
    // console.log("Without env.RCIOTS_ENDPOINT & env.RCIOTS_TOKEN or configfile hardcoded can't do nothing.");
    // process.exit(2);
    //DEBUG TOKEN:
    var token = "d3NzOi8vZGV2aWNlLW1hbmFnZXItcmNpb3RzLmFwcHMub2NwLnJjaW90cy5jb21AMDFmYTk0NThiNjBjNDZkNg==";
  }
} else {
  var token = new Buffer.from(process.env.RCIOTS_ENDPOINT + "@" + process.env.RCIOTS_TOKEN).toString('base64');
}
// check if the config is hardcoded or ask for it to the device-manager
try {
    if (fs.existsSync(cfgFile)) {
        // if cfgFile exist, only the docker-compose source will run.
        config = require(cfgFile);
        config.composes.forEach(function getcomposes(compose, x) {
            console.log("dockercompose: \n" + compose.composefile);
        });
    } else {
      // obtain device-manager host and token to validate
      let buff = new Buffer.from(token, 'base64');
      console.log("token: " + buff);
      let tokenArr = buff.toString('utf8').split("@");
      // socket.io-client for device-manager connection
      const io = require("socket.io-client");
      // plugins status array
      var plugins =  [];
      // IF enableWSEmit is true, the client will push any update throught WebSocket, false to disable.
      // require device-manager connection.
      const enableWSEmit = true;
      // obtain unique ID from Hardware and O.S.
      var nodeid = require('node-machine-id');
      let id = nodeid.machineIdSync({original: true});
      console.log(id);
      // postData for device-manager
      var postData = {"hwid": id,"token": tokenArr[1]};
      // device-manager connection options
      const socket = io.connect(tokenArr[0], {
          auth: {
          token: tokenArr[1],
          hwid: id
          }, 
          ca: fs.readFileSync('ca.cer'),
          secure: true
      });
      socket.on("connect", () => {
          console.log("socket.connected"); // true
          socket.emit("device_enroll", postData);
      });
      socket.on("devicecfg", data => {
          console.log(data);
          data.plugins.forEach(function getplugins(plugin, x) {
            console.log("plugin: \n");
            console.log(plugin);
            var pluginfile = require("./sources/" + plugin.source + ".js");
            pluginfile.run(plugin, function(){
                if (plugins[x]){
                  plugins[x] = plugin;
                }else{
                  plugins.push(plugin);
                }
                if(enableWSEmit){
                  socket.emit("update_plugins", plugins);
                  console.log("emit update_plugins.");
                }
                console.log(plugins);
            })
          });
      });
    }
  } catch(err) {
    console.error(err);
}