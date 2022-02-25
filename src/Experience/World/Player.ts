import * as THREE from 'three'
import SpriteText from 'three-spritetext'

import type Resources from '../Utils/Resources'
import type Time from '../Utils/Time'
import type Client from '../Client'
import type Camera from '../Camera'

import Experience from '../Experience'

class Player {
    experience: Experience
    scene: THREE.Scene
    resources: Resources
    group!: THREE.Group
    camera!: Camera
    time: Time
    client!: Client

    maxSpeed = 10
    maxAngularSpeed = 1

    keysPressed = {
        forward: false,
        left: false,
        right: false,
        back: false,
    }
    disableControls = false
    chatting = false

    cube!: THREE.Mesh
    material!: THREE.MeshBasicMaterial
    geometry!: THREE.BoxGeometry
    nameLabel!: SpriteText
    chatLabel!: SpriteText

    ui!: {
        element: HTMLDivElement
        chat: HTMLFormElement
        chatInput: HTMLInputElement
        send: HTMLButtonElement
    }

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.client = this.experience.client
        this.camera = this.experience.camera

        this.setGroup()
        this.setMesh()
        this.setCamera()
        this.setControls()
        this.setChat()
    }

    private setGroup() {
        this.group = new THREE.Group()
        this.scene.add(this.group)
    }
    private setMesh() {
        // add a cube
        this.material = new THREE.MeshBasicMaterial({
            color: new THREE.Color(this.client.player?.color ?? 'red'),
        })
        this.geometry = new THREE.BoxGeometry(1, 1, 1)

        this.cube = new THREE.Mesh(this.geometry, this.material)
        this.cube.position.y = 0.5
        this.nameLabel = new SpriteText(this.client.player?.name ?? '')
        this.nameLabel.position.y = 1.5
        this.nameLabel.scale.multiplyScalar(0.05)
        this.nameLabel.material.color.set(
            new THREE.Color(this.client.player?.color ?? 'red')
        )
        this.chatLabel = new SpriteText('')
        this.cube.add(this.nameLabel)
        this.cube.add(this.chatLabel)
        this.group.add(this.cube)
    }

    setChat() {
        this.ui = {
            element: document.getElementById('chat-ui') as HTMLDivElement,
            chat: document.getElementById('chat-form') as HTMLFormElement,
            chatInput: document.getElementById(
                'chat-message'
            ) as HTMLInputElement,
            send: document.getElementById('chat-send') as HTMLButtonElement,
        }
        this.ui.chat.addEventListener('submit', (e) => {
            e.preventDefault()
            this.displayChat(this.ui.chatInput.value)
            this.client.chat(this.ui.chatInput.value)
            this.ui.chatInput.value = ''
            this.closeChat()
        })
    }
    displayChat(text: string) {
        this.chatLabel.text = text
        this.chatLabel.position.y = 1
        this.chatLabel.scale.multiplyScalar(0.02)
        this.chatLabel.material.color.set('black')
    }

    private setCamera() {
        this.camera.instance.position.set(0, 3, -3)
        this.camera.controls.object = this.camera.instance.clone()
        this.camera.instance.parent = this.group
    }

    closeChat() {
        this.chatting = false
        this.disableControls = false
        this.ui.element.classList.remove('grid')
        this.ui.element.classList.add('hidden')
    }
    openChat() {
        this.ui.element.classList.remove('hidden')
        this.ui.element.classList.add('grid')
        this.ui.chatInput.focus()

        this.chatting = true
        this.disableControls = true
    }
    onKeyDown(e: KeyboardEvent) {
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
            // enter
            case 'Enter':
                if (!this.chatting) {
                    this.openChat()
                }
                break
            // esc
            case 'Escape':
                if (this.chatting) {
                    this.closeChat()
                }
                break
        }
    }
    onKeyUp(e: KeyboardEvent) {
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
    }
    onMouseOut() {
        this.disableControls = true
        this.keysPressed.forward = false
        this.keysPressed.left = false
        this.keysPressed.right = false
        this.keysPressed.back = false
    }
    onMouseOver() {
        if (!this.chatting) {
            this.disableControls = false
        }
    }

    private setControls() {
        window.addEventListener('keydown', this.onKeyDown.bind(this))
        window.addEventListener('keyup', this.onKeyUp.bind(this))
        window.addEventListener('mouseout', this.onMouseOut.bind(this))
        window.addEventListener('mouseover', this.onMouseOver.bind(this))
    }

    private removeControls() {
        window.removeEventListener('keydown', this.onKeyDown.bind(this))
        window.removeEventListener('keyup', this.onKeyUp.bind(this))
        window.removeEventListener('mouseout', this.onMouseOut.bind(this))
        window.removeEventListener('mouseover', this.onMouseOver.bind(this))
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
        this.camera.instance.copy(
            this.camera.controls.object as THREE.PerspectiveCamera
        )
        if (this.disableControls) return

        const delta = this.time.delta / 1000
        const speed = this.maxSpeed
        const angularSpeed = this.maxAngularSpeed
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

        this.client.move(
            this.group.position.x,
            this.group.position.z,
            this.group.rotation.y
        )
    }
    destroy() {
        this.removeControls()
        this.group.remove(this.cube)
        this.scene.remove(this.group)
    }
}
export default Player
