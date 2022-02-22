import type Resources from '../Utils/Resources'

import * as THREE from 'three'
import Experience from '../Experience'
import Environment from './Environment'

class World {
    experience: Experience
    scene: THREE.Scene
    resources: Resources
    environment?: Environment

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('ready', this.onReady.bind(this))
    }

    private onReady() {
        this.environment = new Environment()
    }

    resize() {
        // noop
    }

    update() {
        // noop
    }
}
export default World
