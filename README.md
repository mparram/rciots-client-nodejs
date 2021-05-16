# RCIOTS client NodeJS
## Remote Control service to manage IOT devices from K8s or Openshift.

### Introduction

***TLTR:*** This is a NodeJS client who can run docker-composes files or metrics collector based on a config received from rciots-device-controller App through websockets, queried from K8s API CR of type edgeTemplate & saved updated data to CR edgeDevice. **Its main purpose is to manage the client config from Openshift Console.**

Together with the repo [rciots-device-controller](https://github.com/mparram/rciots-device-controller), they complete the proposal to the RedHat QIOT Hackfest 2021 from the "Sopra Steria" team.
It's a POC to manage the docker-composes with Quarkus pods, running in RaspberryPi 3b+ with FedoraIOT arm64 from Openshift Console. valid for any device running Docker / podman and able to run nodejs. But extensible through plugins to meet new needs.

The device-controller is an endpoint who waits for connections through Web Socket Secure, these connections are authenticated by a token sent by the client, and it is the only thing to define in the clients, containing the url endpoint and the token. (also needs the ca.cer to trust the ingress CA, preconfigured to the provider of current QIOT cluster *.apps.cluster-cf04.cf04.sandbox37.opentlc.com)
The tokens corresponds to custom resources objects of type edgeTemplate, which are templates with the configuration that we want to load on clients. This configuration, apart from metadata, can be from different plugins, at the moment I have created two, one for metrics, and another for docker-compose also valid for podman.

When the client obtains the definition of docker-compose, its plugin will run the compose and responds through the same socket to the device-controller, to update the status corresponding to this device through the k8s api.
With this we can not only automate the deployment, but also monitor the health of the quarkus pods that we have running on the devices from the Openshift console. We always see in the presentations that the Openshift control ends in the Edge Workers layer, with this solution we can also operate the Edge Devices and sensor layer.
I commented that the other plugin is the metric one, the function of this plugin is to collect metrics every number of seconds from other plugins (so far I have created: dummy random metric, temperature + humidity from DHT, GPS from USB Antenna + gpsd) and send the updates by wss to include the latest state in edgeDevice type CRs.
As ideas for the future, it would be able to make a plugin that simulates launching liveness and readiness probes from the client to the pods that it is executing, and report the states to the device-controller to update it in its edgeDevice.status within the k8s api.

### Requirements 

#### tested on FedoraIOT 33 

By the client side, start updating all system packages:

```
sudo rpm-ostree update
```

Then you can install podman-docker, docker-compose, git to clone this repo, npm and node to download packages and run the client:

```
sudo rpm-ostree install podman-docker docker-compose git npm node
```

Enable & start podman.socket:

```
sudo systemctl enable podman.socket
sudo systemctl start podman.socket
```

clone this repo to /var/home/edge/rciots/ for example:

```
mkdir /var/home/edge/rciots
cd /var/home/edge/rciots
git clone https://github.com/mparram/rciots-client-nodejs.git
cd rciots-client-nodejs
```

Install node dependencies:
```
npm install
```

Add your token and endpoint to connection.cfg. Preconfigured example:
```
{
    "endpoint": "wss://device-controller-user2-qiothackfest.apps.cluster-cf04.cf04.sandbox37.opentlc.com",
    "token": "01fa9458b60c46d6"
}
```

If you want to test in your own instance of device-controller, you need to obtain the ca.cer from  Openshift secrets or with openssl pointing your endpoint:

```
openssl s_client -connect device-controller-user2-qiothackfest.apps.cluster-cf04.cf04.sandbox37.opentlc.com:443 -showcerts
```

you can test it with:

```
node app.js
```

or run with forever:

```
/var/home/edge/rciots/rciots-client-nodejs/node_modules/forever/bin/forever start /var/home/edge/rciots/rciots-client-nodejs/forever/forever.json
```

To Do: Start as service, at the moment Selinux is preventing me from adding it:
```
systemctl enable /var/home/edge/rciots/rciots-client-nodejs/rciots-client.service
systemctl start rciots-client.service
```


