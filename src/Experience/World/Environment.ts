import * as THREE from 'three'
import * as gui from 'lil-gui'
import Experience from '../Experience'
import { EventEmitter } from '../../Utils/EventEmitter'

import { sky } from '../../Colors'

class Environment extends EventEmitter {
    experience: Experience
    scene: THREE.Scene
    gui?: gui.GUI
    debug = {
        near: 8,
        far: 20,
    }
    fog!: THREE.Fog

    constructor() {
        super()
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.gui = this.experience.gui

        this.setFog()
    }

    setBackground(color: string) {
        this.scene.background = new THREE.Color(color)
    }

    setFog() {
        this.fog = new THREE.Fog(sky, this.debug.near, this.debug.far)
        this.scene.fog = this.fog

        this.gui?.add(this.debug, 'near', 0, 10).onChange(() => {
            this.fog.near = this.debug.near
            this.trigger('fogChange')
        })

        this.gui?.add(this.debug, 'far', 0, 100).onChange(() => {
            this.fog.far = this.debug.far
            this.trigger('fogChange')
        })
    }
}
export default Environment
