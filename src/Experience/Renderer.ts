import * as THREE from 'three'
import * as gui from 'lil-gui'

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass'

import type Resources from './Utils/Resources'
import type Sizes from './Utils/Sizes'
import type Time from './Utils/Time'

import Experience from './Experience'

import postProcessShaderVert from './shaders/postProcess.vert'
import postProcessShaderFrag from './shaders/postProcess.frag'

class Renderer {
    experience: Experience
    canvas: HTMLCanvasElement
    sizes: Sizes
    scene: THREE.Scene
    camera: THREE.Camera
    time: Time
    instance!: THREE.WebGLRenderer
    effects!: EffectComposer
    target!: THREE.WebGLRenderTarget | THREE.WebGLMultisampleRenderTarget
    targetClass!: any
    resources: Resources
    postProcess?: ShaderPass
    renderPass?: RenderPass
    debug!: any
    gui?: gui.GUI

    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.currentCamera
        this.time = this.experience.time
        this.gui = this.experience.gui?.addFolder('Renderer')
        this.resources = this.experience.resources

        this.resources.on('ready', this.onReady.bind(this))
    }

    private onReady() {
        this.setDebug()
        this.setInstance()
        this.setEffects()
        this.resize()
    }

    private setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: true,
        })

        this.instance.physicallyCorrectLights = true
        this.instance.outputEncoding = THREE.sRGBEncoding
        this.instance.toneMapping = THREE.ACESFilmicToneMapping
        this.instance.toneMappingExposure = 1

        this.instance.setPixelRatio(this.sizes.pixelRatio)
        this.instance.setSize(this.sizes.width, this.sizes.height)

        this.targetClass = this.instance.capabilities.isWebGL2
            ? THREE.WebGLMultisampleRenderTarget
            : THREE.WebGLRenderTarget
    }

    private setEffects() {
        this.target = new this.targetClass(800, 600, {
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat,
        })

        this.effects = new EffectComposer(this.instance, this.target)

        this.renderPass = new RenderPass(this.scene, this.camera)
        this.effects.addPass(this.renderPass)

        const postProcessShader = {
            uniforms: {
                tDiffuse: { value: null },
                uResolution: { value: new THREE.Vector2() },
                uLensPower: { value: this.debug.lensPower },
            },
            vertexShader: postProcessShaderVert,
            fragmentShader: postProcessShaderFrag,
        }

        this.postProcess = new ShaderPass(postProcessShader)
        this.postProcess.enabled = true
        this.effects.addPass(this.postProcess)

        const gamma = new ShaderPass(GammaCorrectionShader)
        gamma.enabled = false
        this.effects.addPass(gamma)

        const smaa = new SMAAPass(1, 1)
        smaa.enabled =
            this.instance.getPixelRatio() === 1 &&
            !this.instance.capabilities.isWebGL2
        this.effects.addPass(smaa)
    }

    setDebug() {
        this.debug = {
            lensPower: 1.0,
        }
        this.gui?.add(this.debug, 'lensPower', 0.0, 2.0).onChange(() => {
            this.postProcess &&
                (this.postProcess.uniforms.uLensPower.value =
                    this.debug.lensPower)
        })
    }

    resize() {
        this.effects &&
            this.effects.setSize(this.sizes.width, this.sizes.height)
        this.instance &&
            this.instance.setSize(this.sizes.width, this.sizes.height)

        this.postProcess &&
            this.postProcess.uniforms.uResolution.value.set(
                this.sizes.width,
                this.sizes.height
            )
    }
    update() {
        if (this.camera.uuid !== this.experience.currentCamera.uuid) {
            this.camera = this.experience.currentCamera
            this.renderPass && (this.renderPass.camera = this.camera)
        }
        this.effects && this.effects.render()
    }
}

export default Renderer
