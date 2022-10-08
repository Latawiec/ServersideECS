import * as http from 'http'
import * as WebSocket from 'websocket'
import express from 'express'
import * as path from 'path'

import { TestWorld } from "@worlds/TestWorld/TestWorld"
import { Serializer } from "@core/Serialization/Serializer"
import Config from "@config/static.json"
import { GameServer } from '@core/Network/GameServer'
import { GameRoom } from '@core/Network/GameRoom'

const app = express();
console.log(Config.staticDirectory);
app.use(express.static(Config.staticDirectory));

const activePort = process.env.PORT || 8000;
const server = app.listen(activePort, () => {
    console.log("Application started and listening on port: " + activePort);
})


const wsServer = new WebSocket.server({
    httpServer: server
}
);

const gameServer = new GameServer(wsServer);
const serializer = new Serializer();

app.get("/", (req, res) => {
    res.sendFile("index.html");
})

app.get("/world", (req, res) => {
    const room = gameServer.rooms.values().next().value as GameRoom;
    if (room.world) {

        serializer.update(room.world!);
        const serialized = serializer.asJson();
        res.send(serialized);
    } else {
        res.send("World does not exist.")
    }
})

// app.get("/asset", (req, res) => {
//     var assetPath = req.query.path;
//     console.log("Asked for: ", req.query);
//     if (assetPath) {
//         var stringAssetPath = assetPath as string

//         world.getAsset(stringAssetPath,
//             (asset) => {
//                 res.write(asset.Data);
//                 res.send();
//             },
//             (error) => {
//                 console.log("Couldn't find asset: %s", assetPath);
//                 res.statusCode = 404;
//             });
//     }
// })

app.get("/worldAssets", (req, res) => {
    const room = gameServer.rooms.values().next().value as GameRoom;
    room.world?.assetManager.getAllAssetsZip(
    (data) => {
        res.write(data);
        res.send();
    },
    (error) => {
        console.log("Couldn't retrieve world assets", error);
        res.statusCode = 404;
    });
})


function sleep(ms: number) {
return new Promise((resolve) => {
    setTimeout(resolve, ms);
});
}

async function run() {
    await sleep(10);
    const start = Date.now();
    gameServer.update();
    const end = Date.now();
    // console.log("Update took: %d", end - start);
    run();
}

run();