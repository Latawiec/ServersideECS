"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = __importStar(require("websocket"));
const express_1 = __importDefault(require("express"));
const TestWorld_1 = require("../World/TestWorld");
const Serializer_1 = require("../Serialization/Serializer");
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
const app = (0, express_1.default)();
const clientOutputPath = path.resolve(__dirname + "/../../../" + "Client/build");
console.log(clientOutputPath);
app.use(express_1.default.static(clientOutputPath));
console.log('asdf1');
const server = app.listen(8000, () => {
    console.log("Application started and listening on port 8000");
});
const wsServer = new WebSocket.server({
    httpServer: server
});
const world = new TestWorld_1.TestWorld(wsServer);
app.get("/", (req, res) => {
    res.sendFile("index.html");
});
app.get("/world", (req, res) => {
    res.send(JSON.stringify(Serializer_1.WorldSerializer.serializeWorld(world)));
});
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        yield sleep(10);
        world.update();
        run();
    });
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
