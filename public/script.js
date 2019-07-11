(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CoordinateSystem = (function () {
    function CoordinateSystem(canvas, unit, gridSpace) {
        if (gridSpace === void 0) { gridSpace = null; }
        this.grid = null;
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.unit = unit;
        this.center = {
            x: Math.round(canvas.width / 2),
            y: Math.round(canvas.height / 2)
        };
        if (gridSpace) {
            this.grid = {
                numberOfLines: {
                    x: 2 * Math.floor(this.center.x / (this.unit * gridSpace)) + 1,
                    y: 2 * Math.floor(this.center.y / (this.unit * gridSpace)) + 1
                },
                offset: {
                    x: this.center.x % (this.unit * gridSpace),
                    y: this.center.y % (this.unit * gridSpace)
                },
                space: gridSpace * this.unit
            };
        }
    }
    CoordinateSystem.prototype.clear = function () {
        this.ctx.fillStyle = "#fff";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = "#000";
        this.ctx.strokeStyle = "#000";
        this.ctx.lineWidth = 1;
    };
    CoordinateSystem.prototype.drawGrid = function () {
        if (!this.grid) {
            return;
        }
        this.ctx.beginPath();
        this.ctx.strokeStyle = "#ddd";
        for (var i = 0, x = this.grid.offset.x + 0.5; i < this.grid.numberOfLines.x; i++, x += this.grid.space) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        for (var i = 0, y = this.grid.offset.y + 0.5; i < this.grid.numberOfLines.y; i++, y += this.grid.space) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        this.ctx.stroke();
        this.ctx.strokeStyle = "#000";
    };
    CoordinateSystem.prototype.drawLine = function (from, to) {
        from = this.unitsToPixels(from);
        to = this.unitsToPixels(to);
        this.ctx.beginPath();
        this.ctx.moveTo(from.x, from.y);
        this.ctx.lineTo(to.x, to.y);
        this.ctx.stroke();
    };
    CoordinateSystem.prototype.drawLines = function (points) {
        var _this = this;
        this.ctx.beginPath();
        var s = this.unitsToPixels(points[0]);
        this.ctx.moveTo(s.x, s.y);
        points.slice(1).forEach(function (p) {
            p = _this.unitsToPixels(p);
            _this.ctx.lineTo(p.x, p.y);
        });
        this.ctx.stroke();
    };
    CoordinateSystem.prototype.drawLinesFromArray = function (points) {
        this.ctx.beginPath();
        var s = this.unitsToPixels({ x: points[0], y: points[1] });
        this.ctx.moveTo(s.x, s.y);
        for (var i = 2; i < points.length; i += 2) {
            var p = this.unitsToPixels({ x: points[i], y: points[i + 1] });
            this.ctx.lineTo(p.x, p.y);
        }
        this.ctx.stroke();
    };
    CoordinateSystem.prototype.drawPoint = function (point) {
        point = this.unitsToPixels(point);
        this.ctx.fillRect(point.x, point.y, 1, 1);
    };
    CoordinateSystem.prototype.drawPoints = function (points) {
        var _this = this;
        points.forEach(function (p) {
            _this.drawPoint(p);
        });
    };
    CoordinateSystem.prototype.unitsToPixels = function (p) {
        return {
            x: p.x * this.unit + this.center.x,
            y: -p.y * this.unit + this.center.y
        };
    };
    CoordinateSystem.prototype.pixelsToUnits = function (p) {
        return {
            x: (p.x - this.center.x) / this.unit,
            y: -(p.y - this.center.y) / this.unit
        };
    };
    CoordinateSystem.prototype.getCanvas = function () {
        return this.canvas;
    };
    CoordinateSystem.distance = function (p1, p2) {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };
    return CoordinateSystem;
}());
exports.CoordinateSystem = CoordinateSystem;

},{}],2:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CoordinateSystem_1 = require("./CoordinateSystem");
var LineDrawing = (function () {
    function LineDrawing(coordinateSystem, callbacks) {
        this.currentPoint = { x: 0, y: 0 };
        this.points = [];
        this.drawing = false;
        this.mouseEventListeners = {
            over: this.mouseOverEventListener.bind(this),
            leave: this.mouseLeaveEventListener.bind(this),
            move: this.mouseMoveEventListener.bind(this),
            up: this.mouseUpEventListener.bind(this)
        };
        this.coordinateSystem = coordinateSystem;
        this.canvas = coordinateSystem.getCanvas();
        this.callbacks = callbacks;
    }
    LineDrawing.prototype.startDrawing = function () {
        this.renderCoordinatesPopup();
        this.canvas.addEventListener("mouseover", this.mouseEventListeners.over);
        this.canvas.addEventListener("mouseleave", this.mouseEventListeners.leave);
        this.canvas.addEventListener("mousemove", this.mouseEventListeners.move);
        this.canvas.addEventListener("mouseup", this.mouseEventListeners.up);
    };
    LineDrawing.prototype.stopDrawing = function () {
        this.reset();
        this.removeCoordinatesPopup();
        this.canvas.removeEventListener("mouseover", this.mouseEventListeners.over);
        this.canvas.removeEventListener("mouseleave", this.mouseEventListeners.leave);
        this.canvas.removeEventListener("mousemove", this.mouseEventListeners.move);
        this.canvas.removeEventListener("mouseup", this.mouseEventListeners.up);
    };
    LineDrawing.prototype.reset = function () {
        this.drawing = false;
        this.currentPoint = { x: 0, y: 0 };
        this.points = [];
        this.coordinateSystem.clear();
        this.coordinateSystem.drawGrid();
    };
    LineDrawing.prototype.renderCoordinatesPopup = function () {
        this.coordinatesPopup = document.createElement("div");
        this.coordinatesPopup.style.position = "absolute";
        this.coordinatesPopup.style.color = "black";
        this.coordinatesPopup.style.fontSize = "12px";
        document.getElementsByTagName("body")[0].append(this.coordinatesPopup);
    };
    LineDrawing.prototype.removeCoordinatesPopup = function () {
        this.coordinatesPopup.remove();
    };
    LineDrawing.prototype.mouseOverEventListener = function () {
        this.coordinatesPopup.hidden = false;
    };
    LineDrawing.prototype.mouseLeaveEventListener = function () {
        this.coordinatesPopup.hidden = true;
    };
    LineDrawing.prototype.mouseMoveEventListener = function (event) {
        this.currentPoint = this.coordinateSystem.pixelsToUnits({ x: event.x, y: event.y });
        this.coordinatesPopup.style.left = (event.x + 15) + "px";
        this.coordinatesPopup.style.top = (event.y + 15) + "px";
        this.coordinatesPopup.innerHTML = this.currentPoint.x + ", " + this.currentPoint.y;
        if (this.drawing === true) {
            if (this.points.length > 1 && CoordinateSystem_1.CoordinateSystem.distance(this.currentPoint, this.points[0]) <= 10) {
                this.currentPoint = this.points[0];
            }
            this.points.push(this.currentPoint);
            this.coordinateSystem.clear();
            this.coordinateSystem.drawGrid();
            this.coordinateSystem.drawLines(this.points);
            this.points.pop();
        }
    };
    LineDrawing.prototype.mouseUpEventListener = function () {
        this.points.push(this.currentPoint);
        if (this.points.length === 1) {
            this.drawing = true;
            this.callbacks.begin();
        }
        else if (this.currentPoint.x === this.points[0].x && this.currentPoint.y === this.points[0].y) {
            this.drawing = false;
            this.callbacks.end(this.points);
        }
    };
    return LineDrawing;
}());
exports.LineDrawing = LineDrawing;

},{"./CoordinateSystem":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CoordinateSystem_1 = require("./CoordinateSystem");
var LineDrawing_1 = require("./LineDrawing");
window.jsApp = (function () {
    function App(config) {
        var _this = this;
        this.numberOfVectors = 151;
        this.config = config;
        this.ctx = config.canvas.getContext("2d");
        this.coordinateSystem = new CoordinateSystem_1.CoordinateSystem(config.canvas, config.unit, config.gridSpace);
        this.config.resetButton.addEventListener("click", function () { _this.stage1(); });
        this.config.continueButton.addEventListener("click", function () { _this.stage2(); });
    }
    App.prototype.start = function () {
        this.coordinateSystem.clear();
        this.coordinateSystem.drawGrid();
        this.lineDrawing = new LineDrawing_1.LineDrawing(this.coordinateSystem, {
            begin: this.beginDrawingCallback.bind(this),
            end: this.endDrawingCallback.bind(this)
        });
        this.lineDrawing.startDrawing();
        this.stage1();
    };
    App.prototype.beginDrawingCallback = function () {
        this.config.infoPanel.innerHTML = "Close path to continue.";
        this.config.resetButton.hidden = false;
    };
    App.prototype.endDrawingCallback = function (points) {
        this.config.infoPanel.innerHTML = "Click Continue to run animation.";
        this.points = points;
        this.config.continueButton.hidden = false;
    };
    App.prototype.stage1 = function () {
        this.lineDrawing.reset();
        this.config.infoPanel.innerHTML = "Draw any closed path.";
    };
    App.prototype.stage2 = function () {
        this.config.resetButton.hidden = true;
        this.config.continueButton.hidden = true;
        this.lineDrawing.stopDrawing();
        this.config.infoPanel.innerHTML = "Computing...";
        this.calculateFourierCoefficients();
        this.stage3();
    };
    App.prototype.stage3 = function () {
        this.config.infoPanel.innerHTML = "Running animation.";
        this.animate();
    };
    App.prototype.calculateFourierCoefficients = function () {
        var ptr = Module._malloc(16 * this.points.length);
        var buffer = new Float64Array(Module.HEAPU8.buffer, ptr);
        for (var i = 0, j = 0; i < this.points.length; i++, j += 2) {
            buffer[j] = this.points[i].x;
            buffer[j + 1] = this.points[i].y;
        }
        this.fourierCoefficientsPointer = Module._calculateFourierCoefficients(ptr, this.points.length, this.numberOfVectors);
    };
    App.prototype.animate = function () {
        var _this = this;
        var ptr = Module._malloc(16 * (this.numberOfVectors + 1));
        var buffer = new Float64Array(Module.HEAPU8.buffer, ptr, 2 * this.numberOfVectors + 2);
        var t = 0;
        this.points = [];
        setInterval(function () {
            _this.coordinateSystem.clear();
            _this.coordinateSystem.drawGrid();
            Module._calculateNextFrame(t, ptr, _this.fourierCoefficientsPointer, _this.numberOfVectors);
            _this.points.push({
                x: buffer[_this.numberOfVectors * 2],
                y: buffer[_this.numberOfVectors * 2 + 1]
            });
            _this.coordinateSystem.drawLinesFromArray(buffer);
            _this.coordinateSystem.drawLines(_this.points);
            t += 0.5;
        }, 1000 / 60);
    };
    return App;
}());

},{"./CoordinateSystem":1,"./LineDrawing":2}]},{},[3]);
