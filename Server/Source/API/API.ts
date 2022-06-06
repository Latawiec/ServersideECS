import * as http from 'http'
import * as WebSocket from 'websocket'
import express from 'express'
import * as path from 'path'

import { TestWorld } from "../World/TestWorld"
import { WorldSerializer } from "../Serialization/Serializer"
import { World } from '../World/World'
import { send } from 'process'

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

app.get("/asset", (req, res) => {
    var assetPath = req.query.path;
    if (assetPath) {
        var stringAssetPath = assetPath as string

        world.getAsset(stringAssetPath,
            (asset) => {
                res.write(asset.Data);
                res.send();
            },
            (error) => {
                console.log("Couldn't find asset: %s", assetPath);
            });
    }
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