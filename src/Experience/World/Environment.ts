import * as THREE from 'three'
import Experience from '../Experience'

class Environment {
    experience: Experience
    scene: THREE.Scene

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
    }

    setBackground(color: string) {
        this.scene.background = new THREE.Color(color)
    }
}
export default Environment
