import * as THREE from 'three'
import * as gui from 'lil-gui'

import Sizes from './Utils/Sizes'
import Time from './Utils/Time'
import Resources from './Utils/Resources'

import Camera from './Camera'
import Renderer from './Renderer'

import World from './World/World'

import sources from './sources'

let instance: Experience

class Experience {
    canvas!: HTMLCanvasElement
    sizes!: Sizes
    time!: Time
    camera!: Camera
    scene!: THREE.Scene
    renderer!: Renderer
    world!: World
    resources!: Resources
    gui!: gui.GUI

    constructor(canvas?: HTMLCanvasElement) {
        if (instance) return instance
        instance = this

        if (!canvas) throw new Error('Experience requires a canvas element')

        this.canvas = canvas
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.world = new World()
        this.renderer = new Renderer()
        this.gui = new gui.GUI()
        this.gui.close()
        // if not #debug destroy the gui
        if (
            !window.location.hash.match('#debug') &&
            process.env.NODE_ENV !== 'development'
        )
            this.gui.hide()

        this.resize()

        this.sizes.on('resize', this.resize.bind(this))
        this.time.on('tick', this.update.bind(this))

        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(globalThis as any).experience = this
        }
    }

    private resize() {
        this.camera.resize()
        this.renderer.resize()
        this.world.resize()
    }

    private update() {
        this.renderer.update()
        this.world.update()
    }
}

export default Experience
