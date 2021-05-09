FROM arm64v8/node:latest
WORKDIR /app
COPY package.json /app
RUN apt-get update
RUN apt-get install -y gpsd
RUN npm install
COPY . /app
CMD npm start