import memfs from 'memfs';
import unzipper from "unzipper";
import path from "path";
const { Duplex } = require('readable-stream')


export class AssetStorage {
    private _fs = memfs.createFsFromVolume(new memfs.Volume());

    get fs() {
        return this._fs;
    }

    downloadPackage(packagePath: string) : Promise<AssetStorage> {
        const fs = this._fs;
        const self = this;
        return new Promise(async (resolve, reject)  => {
            try {
                var xmlHttp = new XMLHttpRequest();
                xmlHttp.open( "GET", "assetPackage?path=" + packagePath, true );
                xmlHttp.responseType = "arraybuffer";
                xmlHttp.onload = function() {
                    var arrayBuffer = xmlHttp.response;
                    var stream = new Duplex();
                    stream.push(new Uint8Array(arrayBuffer));
                    stream.push(null);
                    stream
                    .pipe(unzipper.Parse())
                    .on('entry', function(entry: any) {
                        // Cut off the .zip file name.
                        const relativePath = entry.path.split(path.sep).slice(1).join(path.sep);
                        if (!relativePath.empty()) {
                            if (entry.type === 'Directory') {
                                fs.mkdirSync(relativePath);
                            }
                            if (entry.type === 'File') {
                                (entry.buffer() as Promise<Buffer>).then((buffer) => {
                                    fs.writeFileSync(relativePath, buffer);
                                    console.log('File: ' + relativePath);
                                });
                            }
                        }
                        entry.autodrain();
                    })
                    .promise()
                    .then( () => {
                        resolve(self);
                    })
                }
            } catch (e) {
                reject(e); 
            }
        });
    }
}