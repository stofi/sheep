import * as THREE from 'three'

import type Sizes from './Utils/Sizes'

import Experience from './Experience'

class Camera {
    experience: Experience
    sizes: Sizes
    scene: THREE.Scene
    canvas: HTMLCanvasElement
    instance!: THREE.PerspectiveCamera
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.setInstance()
    }

    private setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            65,
            this.sizes.width / this.sizes.height,
            0.1,
            100
        )
        this.instance.position.set(0, 3, 2)

        this.instance.lookAt(new THREE.Vector3(0, -1, 0))
        this.scene.add(this.instance)
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
}

export default Camera
