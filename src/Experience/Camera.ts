import * as THREE from 'three'

import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

import type Sizes from './Utils/Sizes'

import Experience from './Experience'

class Camera {
    experience: Experience
    sizes: Sizes
    scene: THREE.Scene
    canvas: HTMLCanvasElement
    instance!: THREE.PerspectiveCamera
    controls!: OrbitControls

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
        this.instance.position.set(0, 6, 2)

        this.instance.lookAt(new THREE.Vector3(0, 0, 0))
        this.scene.add(this.instance)

        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.enableDamping = true
        this.controls.dampingFactor = 0.25
        // min agle
        this.controls.minPolarAngle = 0
        // max angle
        this.controls.maxPolarAngle = Math.PI / 2 - 0.1
    }
    update() {
        this.controls.update()
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }
}

export default Camera
