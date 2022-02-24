import type Resources from '../Utils/Resources'
import type Time from '../Utils/Time'

import * as THREE from 'three'
import Experience from '../Experience'

class Player {
    experience: Experience
    scene: THREE.Scene
    resources: Resources
    group!: THREE.Group
    camera!: THREE.Camera
    time: Time

    keysPressed = {
        forward: false,
        left: false,
        right: false,
        back: false,
    }
    disableControls = false

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time

        this.setGroup()
        this.setMesh()
        this.setCamera()
        this.setControls()
    }

    private setGroup() {
        this.group = new THREE.Group()

        this.scene.add(this.group)
    }
    private setMesh() {
        // add a cube
        const cube = new THREE.Mesh(
            new THREE.BoxBufferGeometry(1, 1, 1),
            new THREE.MeshBasicMaterial({
                color: new THREE.Color('red'),
            })
        )
        cube.position.y = 0.5
        this.group.add(cube)
    }
    private setCamera() {
        this.camera = this.experience.camera.instance.clone()
        this.camera.position.set(0, 3, -5)
        this.camera.lookAt(
            this.group.position.clone().add(new THREE.Vector3(0, 0.25, 0))
        )
        this.group.add(this.camera)

        this.experience.currentCamera = this.camera
    }
    private setControls() {
        window.addEventListener('keydown', (e) => {
            switch (e.key) {
                case 'w':
                    this.keysPressed.forward = true
                    break
                case 'a':
                    this.keysPressed.left = true
                    break
                case 's':
                    this.keysPressed.back = true
                    break
                case 'd':
                    this.keysPressed.right = true
                    break
            }
        })
        window.addEventListener('keyup', (e) => {
            switch (e.key) {
                case 'w':
                    this.keysPressed.forward = false
                    break
                case 'a':
                    this.keysPressed.left = false
                    break
                case 's':
                    this.keysPressed.back = false
                    break
                case 'd':
                    this.keysPressed.right = false
                    break
            }
        })
        // when mouse leaves the canvas
        window.addEventListener('mouseout', () => {
            this.disableControls = true
            this.keysPressed.forward = false
            this.keysPressed.left = false
            this.keysPressed.right = false
            this.keysPressed.back = false
        })
        // when mouse enters the canvas
        window.addEventListener('mouseover', () => {
            this.disableControls = false
        })
    }

    resize() {
        if (
            this.camera instanceof THREE.PerspectiveCamera &&
            this.experience.camera.instance instanceof THREE.PerspectiveCamera
        ) {
            this.camera.aspect =
                this.experience.sizes.width / this.experience.sizes.height
            this.camera.updateProjectionMatrix()
        }
    }

    update() {
        const delta = this.time.delta / 1000
        const speed = 10
        const angularSpeed = 5
        // get current y rotation
        const yRotation = this.group.rotation.y
        const movement = new THREE.Vector3(0, 0, 0)
        movement.z += this.keysPressed.forward ? speed : 0
        movement.z -= this.keysPressed.back ? speed : 0
        // rotate movement by current y rotation
        movement.applyAxisAngle(new THREE.Vector3(0, 1, 0), yRotation)
        const rotation = new THREE.Vector3(0, 0, 0)
        rotation.y = this.keysPressed.left ? angularSpeed : 0
        rotation.y -= this.keysPressed.right ? angularSpeed : 0

        this.group.rotation.y += rotation.y * delta

        this.group.position.add(movement.multiplyScalar(delta))
    }
}
export default Player
