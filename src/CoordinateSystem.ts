export interface Point {
    x: number,
    y: number
}



export class CoordinateSystem {
    private canvas: HTMLCanvasElement
    private ctx: CanvasRenderingContext2D
    private unit: number
    private center: Point
    private grid: null | {
        numberOfLines: { x: number, y: number },
        offset: { x: number, y: number },
        space: number
    } = null



    public constructor(canvas: HTMLCanvasElement, unit: number, gridSpace: number | null = null) {
        this.canvas = canvas
        this.ctx = canvas.getContext("2d")
        this.unit = unit
        this.center = {
            x: Math.round(canvas.width / 2),
            y: Math.round(canvas.height / 2)
        }

        if(gridSpace) {
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
            }
        }
    }



    public clear() {
        this.ctx.fillStyle = "#fff"
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)

        this.ctx.fillStyle = "#000"
        this.ctx.strokeStyle = "#000"
        this.ctx.lineWidth = 1
    }



    public drawGrid() {
        if(!this.grid) {
            return
        }

        this.ctx.beginPath()
        this.ctx.strokeStyle = "#ddd"

        for(let i = 0, x = this.grid.offset.x + 0.5; i < this.grid.numberOfLines.x; i++, x += this.grid.space) {
            this.ctx.moveTo(x, 0)
            this.ctx.lineTo(x, this.canvas.height)
        }

        for(let i = 0, y = this.grid.offset.y + 0.5; i < this.grid.numberOfLines.y; i++, y += this.grid.space) {
            this.ctx.moveTo(0, y)
            this.ctx.lineTo(this.canvas.width, y)
        }

        this.ctx.stroke()
        this.ctx.strokeStyle = "#000"
    }



    public drawLine(from: Point, to: Point) {
        from = this.unitsToPixels(from)
        to = this.unitsToPixels(to)

        this.ctx.beginPath()

        this.ctx.moveTo(from.x, from.y)
        this.ctx.lineTo(to.x, to.y)

        this.ctx.stroke()
    }



    public drawLines(points: Point[]) {
        this.ctx.beginPath()
        let s = this.unitsToPixels(points[0])
        this.ctx.moveTo(s.x, s.y)
        
        points.slice(1).forEach(p => {
            p = this.unitsToPixels(p)
            this.ctx.lineTo(p.x, p.y)
        })

        this.ctx.stroke()
    }



    public drawLinesFromArray(points: Float64Array) {
        this.ctx.beginPath()
        let s = this.unitsToPixels({ x: points[0], y: points[1] })
        this.ctx.moveTo(s.x, s.y)
        
        for(let i = 2; i < points.length; i += 2) {
            let p = this.unitsToPixels({ x: points[i], y: points[i + 1] })
            this.ctx.lineTo(p.x, p.y)
        }

        this.ctx.stroke()
    }



    public drawPoint(point: Point) {
        point = this.unitsToPixels(point)
        this.ctx.fillRect(point.x, point.y, 1, 1)
    }

    

    public drawPoints(points: Point[]) {
        points.forEach(p => {
            this.drawPoint(p)
        })
    }



    public unitsToPixels(p: Point): Point {
        return {
            x: p.x * this.unit + this.center.x,
            y: -p.y * this.unit + this.center.y
        }
    }



    public pixelsToUnits(p: Point): Point {
        return {
            x: (p.x - this.center.x) / this.unit,
            y: -(p.y - this.center.y) / this.unit
        }
    }



    public getCanvas(): HTMLCanvasElement {
        return this.canvas
    }

    

    public static distance(p1: Point, p2: Point): number {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2))
    }

}