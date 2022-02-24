import type Resources from '../Utils/Resources'
import type Client from '../Client'

import * as THREE from 'three'
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
        this.client.on('update', this.updatePeers.bind(this))
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
        const myself = this.client.player!
        this.peers = room.players.reduce((acc: any, player) => {
            if (player.id !== myself.id) {
                const object = new THREE.Mesh(
                    new THREE.BoxBufferGeometry(1, 1, 1),
                    new THREE.MeshBasicMaterial({
                        color: new THREE.Color(player.color),
                    })
                )
                object.position.set(player.x, 0.5, player.z)
                object.rotation.y = player.thetaY
                acc[player.id] = {
                    player,
                    object,
                }
                this.scene.add(object)
            }
            return acc
        }, {})
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
