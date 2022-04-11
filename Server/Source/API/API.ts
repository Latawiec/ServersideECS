import * as http from 'http'
import * as WebSocket from 'websocket'
import express from 'express'

import { TestWorld } from "../World/TestWorld"
import { WorldSerializer } from "../Serialization/Serializer"
import { World } from '../World/World'
import { send } from 'process'

var path = require('path');

const app = express();
const clientOutputPath = path.resolve(__dirname + "/../../../" + "Client/build")
console.log(clientOutputPath);
app.use(express.static(clientOutputPath));

const activePort = process.env.PORT || 8000;
const server = app.listen(activePort, () => {
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