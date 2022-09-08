import { throws } from "assert";
import * as fs from "fs"
import * as path from "path"

export enum AssetType {
    Unknown,
    Image,
    Model,
    Shader,
    Sound
    // Whatever.
}

export class Asset {
    private _type: AssetType = AssetType.Unknown;
    private _data: Uint8Array = new Uint8Array();
    private _size: number = 0;

    constructor(type: AssetType, data: Uint8Array, size: number) {
        this._type = type;
        this._data = data;
        this._size = size;
    }

    get Type(): Readonly<AssetType> {
        return this._type;
    }

    get Data(): Readonly<Uint8Array> {
        return this._data;
    }

    get Size(): Readonly<number> {

        return this._size;
    }
}

export enum AssetError {
    Success,
    Unknown,
    FileMissing
}

export class AssetBinding {
    private _path = ""
    private _type: AssetType = AssetType.Unknown;

    constructor(path: Readonly<string>, type: AssetType = AssetType.Unknown) {
        this._path = path;
        this._type = type
    }
}

export class AssetManager {
    private _assetStorageRoot: Readonly<string> = ""
    private _assetBindingCache: Map<Readonly<string>, AssetBinding> = new Map;

    constructor(assetStorageRoot: Readonly<string>) {
        if (fs.existsSync(assetStorageRoot) ) {
            this._assetStorageRoot = assetStorageRoot
        }
    }

    bindAsset(assetPath: Readonly<string>) : AssetBinding {
        if (this._assetBindingCache.has(assetPath)) {
            return this._assetBindingCache.get(assetPath)!;
        }

        const absoluteAssetPath = path.join(this._assetStorageRoot, assetPath);
        if (fs.existsSync(absoluteAssetPath)) {
            // Add figuring out the asset type from path it lies in? Could be nice.
            return new AssetBinding(assetPath)
        }

        throw new Error("Requested asset does not exist: " + assetPath);
    }

    getAsset(assetPath: Readonly<string>, onSuccess: (asset: Asset) => void, onError: (error: AssetError) => void ) {
        const totalPath = path.join(this._assetStorageRoot, assetPath);
        console.log("Asset absolute path: %s", totalPath);
        fs.readFile(totalPath, (err, data) => {
            if (err !== null) {
                console.log(err);
                onError(AssetError.Unknown);
                return;
            }

            var result = new Asset(AssetType.Unknown, data, data.byteLength);

            onSuccess(result);
        })
    }

}