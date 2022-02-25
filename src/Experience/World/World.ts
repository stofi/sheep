import * as THREE from 'three'
import SpriteText from 'three-spritetext'

import type Resources from '../Utils/Resources'
import type Client from '../Client'

import Experience from '../Experience'
import Environment from './Environment'
import Player from './Player'

import checkersFrag from '../shaders/checkers.frag'
import checkersVert from '../shaders/checkers.vert'

import { green } from '../../Colors'

class World {
    experience: Experience
    scene: THREE.Scene
    resources: Resources
    environment?: Environment
    player!: Player
    peers: any = {}
    client: Client
    peerGeometry = new THREE.BoxBufferGeometry(1, 1, 1)

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.client = this.experience.client

        if (this.resources.toLoad === this.resources.loaded) {
            this.onReady()
        } else {
            this.resources.on('ready', this.onReady.bind(this))
        }
        // this.client.on('update', this.updatePeers.bind(this))
        this.client.on('playerJoined', this.onPlayerJoined.bind(this))
        this.client.on('playerLeft', this.onPlayerLeft.bind(this))
        this.client.on('playerMoved', this.onPlayerMoved.bind(this))
        this.client.on('playerChat', this.onPlayerChat.bind(this))
    }

    private onReady() {
        this.environment = new Environment()

        // add plane
        const geometry = new THREE.PlaneBufferGeometry(100, 100, 20, 20)
        // const material = new THREE.MeshBasicMaterial({
        //     color: new THREE.Color(green),
        //     side: THREE.DoubleSide,
        //     wireframe: true,
        // })
        const material = new THREE.ShaderMaterial({
            uniforms: {
                fogColor: { value: new THREE.Color(0xffffff) },
                fogNear: { value: 1 },
                fogFar: { value: 100 },
            },
            fragmentShader: checkersFrag,
            vertexShader: checkersVert,
            fog: true,
        })
        this.environment.on('fogChange', () => {
            const fog = this.environment!.fog!
            material.uniforms.fogColor.value = fog.color
            material.uniforms.fogNear.value = fog.near
            material.uniforms.fogFar.value = fog.far
        })
        const plane = new THREE.Mesh(geometry, material)
        plane.rotation.x = -Math.PI / 2
        this.scene.add(plane)
        this.player = new Player()
        this.setPeers()
    }

    setPeers() {
        const room = this.client.room!
        if (!room.players) return
        room.players.forEach(this.createPeer.bind(this))
    }

    createPeer(player: {
        id: string
        color: string
        x: number
        z: number
        thetaY: number
        name: string
    }) {
        if (this.peers[player.id]) return

        const myself = this.client.player!
        if (player.id === myself.id) return

        const object = new THREE.Mesh(
            this.peerGeometry,
            new THREE.MeshBasicMaterial({
                color: new THREE.Color(player.color),
            })
        )
        object.position.set(player.x, 0.5, player.z)
        object.rotation.y = player.thetaY

        const chatLabel = new SpriteText('')
        object.add(chatLabel)

        const nameLabel = new SpriteText(player.name ?? '')
        nameLabel.position.y = 1.5
        nameLabel.scale.multiplyScalar(0.05)
        nameLabel.material.color.set(new THREE.Color(player.color ?? 'red'))
        object.add(nameLabel)

        this.peers[player.id] = {
            player,
            object,
            chat: chatLabel,
        }

        this.scene.add(object)
    }

    updatePeers() {
        const room = this.client.room!
        const myself = this.client.player!
        // remove peers not in room
        Object.keys(this.peers).forEach((id) => {
            if (!room.players.find((player) => player.id === id)) {
                this.scene.remove(this.peers[id].object)
                delete this.peers[id]
            }
        })
        // add peers not in peers
        room.players.forEach((player) => {
            if (player.id === myself.id) return
            if (!this.peers[player.id]) {
                const object = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(1, 1, 1),
                    new THREE.MeshBasicMaterial({
                        color: new THREE.Color(player.color),
                    })
                )
                object.position.set(player.x, 0.5, player.z)
                object.rotation.y = player.thetaY
                this.peers[player.id] = {
                    player,
                    object,
                }
                this.scene.add(object)
            }
        })
        // update peers
        Object.keys(this.peers).forEach((id) => {
            const peer = this.peers[id]

            peer.object.position.set(peer.player.x, 0.5, peer.player.z)
            peer.object.rotation.y = peer.player.thetaY
        })
    }

    onPlayerChat(data: { id: string; message: string }) {
        console.log(data)
        if (!data) return
        const id = data.id
        const message = data.message
        if (this.peers[id]) {
            this.peers[id].chat.text = message
            this.peers[id].chat.position.y = 1
            this.peers[id].chat.scale.multiplyScalar(0.02)
            this.peers[id].chat.material.color.set('black')
        }
    }
    onPlayerMoved(data: any) {
        if (!data) return

        const id = data.id
        const x = data.x
        const z = data.z
        const thetaY = data.thetaY
        if (this.peers[id]) {
            this.peers[id].object.position.set(x, 0.5, z)
            this.peers[id].object.rotation.y = thetaY
        }
    }
    onPlayerLeft(data: { id: string }) {
        if (!data) return
        const id = data.id
        if (this.peers[id]) {
            this.scene.remove(this.peers[id].object)
            delete this.peers[id]
        }
    }
    onPlayerJoined(data: {
        player: {
            id: string
            color: string
            x: number
            z: number
            thetaY: number
            name: string
        }
    }) {
        if (!data) return
        const player = data.player

        this.createPeer(player)
    }

    resize() {
        this.player && this.player.resize()
    }

    update() {
        this.player && this.player.update()
    }

    destroy() {
        this.player && this.player.destroy()
    }
}
export default World
