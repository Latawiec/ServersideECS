import * as http from 'http'
import * as WebSocket from 'websocket'
import express from 'express'

import { TestWorld } from "../World/TestWorld"
import { WorldSerializer } from "../Serialization/Serializer"
import { World } from '../World/World'
import { send } from 'process'
import * as fs from 'fs'
import * as https from 'https';



// import * as https from 'https';
// import * as fs from 'fs';

// var path = require('path');

// const app = express();
// const clientOutputPath = path.resolve(__dirname + "/../../../" + "Client/build")
// console.log(clientOutputPath);
// app.use(express.static(clientOutputPath));

// console.log('asdf1');

// const key = fs.readFileSync(path.resolve(__dirname, "\\key-rsa.pem"));
// const cert = fs.readFileSync(path.resolve(__dirname, "\\cert.pem"));

// const server = https.createServer({key, cert}, app);

// server.listen(8000, () => {
//     console.log("Application started and listening on port 8000");
// })


var path = require('path');

const app = express();
const clientOutputPath = path.resolve(__dirname + "/../../../" + "Client/build")
console.log(clientOutputPath);
app.use(express.static(clientOutputPath));

const activePort = process.env.PORT || 8000;
const key = fs.readFileSync(path.resolve(__dirname + "../../../SSL/key-rsa.pem"));
const cert = fs.readFileSync(path.resolve(__dirname + "../../../SSL/cert.pem"));
const server = https.createServer({ key, cert }, app);

server.listen(activePort, () => {
    console.log("Application started and listening on port: " + activePort);
})


const wsServer = new WebSocket.server({
    httpServer: server
}
);

const world: TestWorld = new TestWorld(wsServer);

app.get("/", (req, res) => {
    res.sendFile("index.html");
})

app.get("/world", (req, res) => {
    res.send(JSON.stringify(WorldSerializer.serializeWorld(world)));
})


function sleep(ms: number) {
return new Promise((resolve) => {
    setTimeout(resolve, ms);
});
}

async function run() {
    await sleep(10);
    world.update();
    run();
}

run();







// wsServer.on('request', (req) => {
//     const connection = req.accept(null, req.origin);

//     connection.on('message', (message) => {
//         console.log('Received Message: ', message);
//         //connection.sendUTF("Hi this is WebSocket server!");
//         connection.send(JSON.stringify(WorldSerializer.serializeWorld(world)));
//     })

//     console.log(JSON.stringify(req.socket.remoteAddress));
    
    

//     connection.on('close', (reasonCode, description) => {
//         console.log('Client has disconnected.')
//     }) 
// });
