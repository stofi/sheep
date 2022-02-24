import type Resources from '../Utils/Resources'

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

    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        this.resources.on('ready', this.onReady.bind(this))
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
    }

    resize() {
        this.player && this.player.resize()
    }

    update() {
        this.player && this.player.update()
    }
}
export default World
