import { CoordinateSystem, Point } from "./CoordinateSystem"



interface LineDrawingCallbacks {
    begin: () => void,
    end: (points: Point[]) => void
}



export class LineDrawing {
    private coordinateSystem: CoordinateSystem
    private canvas: HTMLCanvasElement
    private coordinatesPopup: HTMLDivElement
    private currentPoint: Point = { x: 0, y: 0 }
    private points: Point[] = []
    private drawing: Boolean = false
    private callbacks: LineDrawingCallbacks
    private mouseEventListeners = {
        over: this.mouseOverEventListener.bind(this),
        leave: this.mouseLeaveEventListener.bind(this),
        move: this.mouseMoveEventListener.bind(this),
        up: this.mouseUpEventListener.bind(this)
    }


    constructor(coordinateSystem: CoordinateSystem, callbacks: LineDrawingCallbacks) {
        this.coordinateSystem = coordinateSystem
        this.canvas = coordinateSystem.getCanvas()
        this.callbacks = callbacks
    }


    public startDrawing() {
        this.renderCoordinatesPopup()
        this.canvas.addEventListener("mouseover", this.mouseEventListeners.over)
        this.canvas.addEventListener("mouseleave", this.mouseEventListeners.leave)
        this.canvas.addEventListener("mousemove", this.mouseEventListeners.move)
        this.canvas.addEventListener("mouseup", this.mouseEventListeners.up)
    }


    public stopDrawing() {
        this.reset()
        this.removeCoordinatesPopup()
        this.canvas.removeEventListener("mouseover", this.mouseEventListeners.over)
        this.canvas.removeEventListener("mouseleave", this.mouseEventListeners.leave)
        this.canvas.removeEventListener("mousemove", this.mouseEventListeners.move)
        this.canvas.removeEventListener("mouseup", this.mouseEventListeners.up)
    }


    public reset() {
        this.drawing = false
        this.currentPoint = { x: 0, y: 0 }
        this.points = []
        this.coordinateSystem.clear()
        this.coordinateSystem.drawGrid()
    }


    private renderCoordinatesPopup() {
        this.coordinatesPopup = document.createElement("div")
        this.coordinatesPopup.style.position = "absolute"
        this.coordinatesPopup.style.color = "black"
        this.coordinatesPopup.style.fontSize = "12px"
        document.getElementsByTagName("body")[0].append(this.coordinatesPopup)
    }


    private removeCoordinatesPopup() {
        this.coordinatesPopup.remove()
    }


    private mouseOverEventListener() {
        this.coordinatesPopup.hidden = false
    }


    private mouseLeaveEventListener() {
        this.coordinatesPopup.hidden = true
    }


    private mouseMoveEventListener(event: MouseEvent) {
        this.currentPoint = this.coordinateSystem.pixelsToUnits({ x: event.x, y: event.y })

        this.coordinatesPopup.style.left = (event.x + 15) + "px"
        this.coordinatesPopup.style.top = (event.y + 15) + "px"
        this.coordinatesPopup.innerHTML = this.currentPoint.x + ", " + this.currentPoint.y

        if(this.drawing === true) { 
            if(this.points.length > 1 && CoordinateSystem.distance(this.currentPoint, this.points[0]) <= 10) {
                this.currentPoint = this.points[0]
            }

            this.points.push(this.currentPoint)
            this.coordinateSystem.clear()
            this.coordinateSystem.drawGrid()
            this.coordinateSystem.drawLines(this.points)
            this.points.pop()
        }
    }


    private mouseUpEventListener() {
        this.points.push(this.currentPoint)

        if(this.points.length === 1) {
            this.drawing = true
            this.callbacks.begin()
        }
        else if(this.currentPoint.x === this.points[0].x && this.currentPoint.y === this.points[0].y) {
            this.drawing = false
            this.callbacks.end(this.points)
        }
    }
}