import { CoordinateSystem, Point } from "./CoordinateSystem"
import { LineDrawing } from "./LineDrawing"


declare var Module: any


interface Config {
    canvas: HTMLCanvasElement,
    unit: number,
    gridSpace: number,
    infoPanel: HTMLDivElement,
    resetButton: HTMLButtonElement,
    continueButton: HTMLButtonElement
}



(window as any).jsApp = class App {
    private config: Config
    private ctx: CanvasRenderingContext2D
    private coordinateSystem: CoordinateSystem
    private lineDrawing: LineDrawing
    private points: Point[]
    private fourierCoefficientsPointer: any
    private vectors: Float64Array
    private numberOfVectors = 151


    constructor(config: Config) {
        this.config = config
        this.ctx = config.canvas.getContext("2d")
        this.coordinateSystem = new CoordinateSystem(config.canvas, config.unit, config.gridSpace)
        this.config.resetButton.addEventListener("click", () => { this.stage1() })
        this.config.continueButton.addEventListener("click", () => { this.stage2() })
    }


    public start() {
        this.coordinateSystem.clear()
        this.coordinateSystem.drawGrid()

        this.lineDrawing = new LineDrawing(this.coordinateSystem, { 
            begin: this.beginDrawingCallback.bind(this),
            end: this.endDrawingCallback.bind(this) 
        })

        this.lineDrawing.startDrawing()
        this.stage1()
    }


    private beginDrawingCallback() {
        this.config.infoPanel.innerHTML = "Close path to continue."
        this.config.resetButton.hidden = false
    }


    private endDrawingCallback(points: Point[]) {
        this.config.infoPanel.innerHTML = "Click Continue to run animation."
        this.points = points
        this.config.continueButton.hidden = false
    }


    private stage1() {
        this.lineDrawing.reset()
        this.config.infoPanel.innerHTML = "Draw any closed path."
    }


    private stage2() {
        this.config.resetButton.hidden = true
        this.config.continueButton.hidden = true

        this.lineDrawing.stopDrawing()
        this.config.infoPanel.innerHTML = "Computing..."
        this.calculateFourierCoefficients()
        this.stage3()
    }


    private stage3() {
        this.config.infoPanel.innerHTML = "Running animation."
        this.animate()
    }


    private calculateFourierCoefficients() {
        let ptr = Module._malloc(16 * this.points.length)
        let buffer = new Float64Array(Module.HEAPU8.buffer, ptr)

        for(let i = 0, j = 0; i < this.points.length; i++, j += 2) {
            buffer[j] = this.points[i].x 
            buffer[j + 1] = this.points[i].y
        }

        this.fourierCoefficientsPointer = Module._calculateFourierCoefficients(ptr, this.points.length, this.numberOfVectors)
    }


    private animate() {
        let ptr = Module._malloc(16 * (this.numberOfVectors + 1))
        let buffer = new Float64Array(Module.HEAPU8.buffer, ptr, 2 * this.numberOfVectors + 2)

        let t = 0
        this.points = []

        setInterval(() => {
            this.coordinateSystem.clear()
            this.coordinateSystem.drawGrid()

            Module._calculateNextFrame(t, ptr, this.fourierCoefficientsPointer, this.numberOfVectors)

            this.points.push({
                x: buffer[this.numberOfVectors * 2],
                y: buffer[this.numberOfVectors * 2 + 1]
             })

            this.coordinateSystem.drawLinesFromArray(buffer)
            this.coordinateSystem.drawLines(this.points)

            t += 0.5
        }, 1000 / 60)
    }

}