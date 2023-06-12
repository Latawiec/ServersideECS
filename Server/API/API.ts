import express from 'express'
import * as path from 'path'
import * as fs from 'fs'

import { TestWorld } from "@worlds/TestWorld/TestWorld"
import { Serializer } from "@core/Serialization/Serializer"
import StaticConfig from "@config/static.json"
import AssetsConfig from "@config/assets.json"
import { GameServer } from '@core/Network/GameServer'
import { GameRoom } from '@core/Network/GameRoom'

const app = express();
console.log(StaticConfig.staticDirectory);
app.use(express.static(StaticConfig.staticDirectory));

const activePort = process.env.PORT || 8000;
const server = app.listen(activePort, () => {
    console.log("Application started and listening on port: " + activePort);
});

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

app.get("/joinGameRoom", (req, res) => {

});

app.post("/createGameRoom", (req, res) => {

})

app.get("/assetPackage", (req, res) => {
    console.log(`Asked asset Package: ${req.query.path}`)
    var assetPath = req.query.path;

    if (assetPath) {
        var stringAssetPath = assetPath as string;
        var absoluteAssetsPath = path.resolve(path.join(AssetsConfig.packageOutputDir, stringAssetPath));

        fs.access(absoluteAssetsPath, (err) => {
            if (err) {
                console.log(`Asset Package access error ${err}`);
                res.status(404).send('Package \"' + stringAssetPath + '\" not found.');
            } else {
                res.sendFile(absoluteAssetsPath);
            }
        })
    }
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