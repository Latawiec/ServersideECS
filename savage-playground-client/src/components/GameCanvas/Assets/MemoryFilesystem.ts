import memfs from 'memfs';

export class MemoryFilesystem {
    private _fs = memfs.createFsFromVolume(new memfs.Volume());
    private static instance: MemoryFilesystem;
    
    static get fs() {
        if (!MemoryFilesystem.instance) {
            MemoryFilesystem.instance = new MemoryFilesystem();
        }

        return MemoryFilesystem.instance._fs;
    }
}