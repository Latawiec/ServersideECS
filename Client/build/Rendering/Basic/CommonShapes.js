export var CommonShapes;
(function (CommonShapes) {
    class Square {
        constructor() {
            this._vertices = Float32Array.from([
                1.0, 1.0, 0.0,
                -1.0, 1.0, 0.0,
                1.0, -1.0, 0.0,
                -1.0, -1.0, 0.0,
            ]);
            this._indices = Uint16Array.from([
                0, 1, 2, 2, 1, 3
            ]);
        }
        get vertices() {
            return this._vertices;
        }
        get indices() {
            return this._indices;
        }
    }
    CommonShapes.Square = Square;
    ;
})(CommonShapes || (CommonShapes = {}));
