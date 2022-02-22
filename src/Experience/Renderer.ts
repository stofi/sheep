import type Sizes from './Utils/Sizes'
import type Camera from './Camera'

import * as THREE from 'three'

import Experience from './Experience'

class Renderer {
    experience: Experience
    canvas: HTMLCanvasElement
    sizes: Sizes
    scene: THREE.Scene
    camera: Camera
    instance!: THREE.WebGLRenderer

    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera

        this.setInstance()
    }

    private setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        })
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.instance.setSize(this.sizes.width, this.sizes.height)
    }

    resize() {
        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.instance.setSize(this.sizes.width, this.sizes.height)
    }

    update() {
        this.instance.render(this.scene, this.camera.instance)
    }
}

export default Renderer
