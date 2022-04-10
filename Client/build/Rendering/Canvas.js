export var Layer;
(function (Layer) {
    Layer[Layer["Background"] = 0] = "Background";
    Layer[Layer["Layer0"] = 1] = "Layer0";
    Layer[Layer["Layer1"] = 2] = "Layer1";
    Layer[Layer["Foreground"] = 3] = "Foreground";
})(Layer || (Layer = {}));
;
;
export class Canvas {
    constructor(canvas) {
        this._canvas = canvas;
        this._drawRequests = new Map();
        this._gl = canvas.getContext('webgl');
    }
    executeDraw() {
        this._gl.clearColor(0.0, 1.0, 0.0, 1.0);
        this._gl.clearDepth(1.0);
        this._gl.enable(this._gl.DEPTH_TEST);
        this._gl.depthFunc(this._gl.LEQUAL);
        this._gl.clear(this._gl.COLOR_BUFFER_BIT | this._gl.DEPTH_BUFFER_BIT);
        if (this._drawRequests.get(Layer.Background) !== undefined && this._drawRequests.get(Layer.Background).length !== 0) {
            this._drawRequests.get(Layer.Background).forEach(request => {
                request.draw();
            });
        }
        if (this._drawRequests.get(Layer.Layer0) !== undefined && this._drawRequests.get(Layer.Layer0).length !== 0) {
            this._drawRequests.get(Layer.Layer0).forEach(request => {
                request.draw();
            });
        }
        if (this._drawRequests.get(Layer.Layer1) !== undefined && this._drawRequests.get(Layer.Layer1).length !== 0) {
            this._drawRequests.get(Layer.Layer1).forEach(request => {
                request.draw();
            });
        }
        if (this._drawRequests.get(Layer.Foreground) !== undefined && this._drawRequests.get(Layer.Foreground).length !== 0) {
            this._drawRequests.get(Layer.Foreground).forEach(request => {
                request.draw();
            });
        }
        this._drawRequests.clear();
    }
    requestDraw(layer, request) {
        var _a;
        if (!this._drawRequests.has(layer)) {
            this._drawRequests.set(layer, []);
        }
        (_a = this._drawRequests.get(layer)) === null || _a === void 0 ? void 0 : _a.push(request);
    }
    get width() {
        return this._canvas.width;
    }
    get height() {
        return this._canvas.height;
    }
    get glContext() {
        return this._gl;
    }
}
