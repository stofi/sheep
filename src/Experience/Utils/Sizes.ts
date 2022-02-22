import { EventEmitter } from '../../Utils/EventEmitter'

class Sizes extends EventEmitter {
    width!: number
    height!: number
    pixelRatio!: number
    maxPixelRatio = 1

    constructor() {
        super()
        this.setSizes()

        //if window has ?lowres=true, then set maxPixelRatio to 1

        window.addEventListener('resize', this.setSizes.bind(this))
    }

    private setSizes() {
        if (!window.location.hash.match('lowres')) {
            this.maxPixelRatio = 2
        }
        this.width = window.innerWidth
        this.height = window.innerHeight
        this.pixelRatio = Math.min(window.devicePixelRatio, this.maxPixelRatio)
        this.trigger('resize')
    }
}

export default Sizes
