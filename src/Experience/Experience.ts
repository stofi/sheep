import * as THREE from 'three'
import * as gui from 'lil-gui'

import Sizes from './Utils/Sizes'
import Time from './Utils/Time'
import Resources from './Utils/Resources'

import Camera from './Camera'
import Renderer from './Renderer'

import World from './World/World'

import sources from './sources'

import Client from './Client'

let instance: Experience

type ExperienceState =
    | 'joining'
    | 'running'
    | 'leaving'
    | 'initializing'
    | 'error'

type ExperienceStateTransitions = {
    [key in ExperienceState]: ExperienceState[]
}

class Experience {
    canvas!: HTMLCanvasElement
    sizes!: Sizes
    time!: Time
    camera!: Camera
    scene!: THREE.Scene
    renderer!: Renderer
    world?: World
    resources!: Resources
    gui!: gui.GUI
    currentCamera!: THREE.Camera
    state!: ExperienceState
    transitions: ExperienceStateTransitions = {
        initializing: ['joining', 'error'],
        joining: ['running', 'leaving', 'error'],
        running: ['leaving', 'error'],
        leaving: ['initializing', 'error'],
        error: ['initializing'],
    }
    ui!: {
        element: HTMLDivElement
        form: HTMLFormElement
        join: HTMLButtonElement
    }
    client!: Client

    constructor(canvas?: HTMLCanvasElement) {
        if (instance) return instance
        instance = this

        if (!canvas) throw new Error('Experience requires a canvas element')

        this.canvas = canvas
        this.gui = new gui.GUI()
        this.sizes = new Sizes()
        this.time = new Time()
        this.scene = new THREE.Scene()
        this.resources = new Resources(sources)
        this.camera = new Camera()
        this.currentCamera = this.camera.instance
        // this.world = new World()
        this.renderer = new Renderer()

        this.client = new Client('ws://metaverse.letna.dev/api')

        this.client.on('joined', () => {
            this.setState('running')
        })

        this.gui.close()
        // if not #debug destroy the gui
        if (
            !window.location.hash.match('#debug') &&
            process.env.NODE_ENV !== 'development'
        )
            this.gui.hide()

        this.resize()

        this.sizes.on('resize', this.resize.bind(this))
        this.time.on('tick', this.update.bind(this))

        if (process.env.NODE_ENV === 'development') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            ;(globalThis as any).experience = this
        }

        this.setState('initializing')
    }

    private setState(state: ExperienceState) {
        if (state === 'initializing' && this.state === undefined) {
            this.state = state
        } else {
            const oldState = this.state
            const newState = state
            if (this.transitions[oldState].includes(newState)) {
                this.state = newState
            }
        }
        switch (this.state) {
            case 'initializing':
                this.initialize()
                break
            case 'joining':
                this.join()
                break
            case 'running':
                this.run()
                break
            case 'leaving':
                this.leave()
                break
            case 'error':
                this.error()
                break
        }
    }
    initialize() {
        if (!this.ui) {
            this.ui = {
                element: document.getElementById('ui') as HTMLDivElement,
                form: document.getElementById('form') as HTMLFormElement,
                join: document.getElementById('join') as HTMLButtonElement,
            }
            this.ui.join.addEventListener('click', (e) => {
                e.preventDefault()
                this.setState('joining')
            })
        }
        this.ui.join.disabled = false
        this.ui.element.classList.remove('hidden')
        this.ui.element.classList.add('grid')
    }
    join() {
        this.ui.join.disabled = true
        // get data from form as json
        const object: any = {}
        new FormData(this.ui.form).forEach(
            (value, key) => (object[key] = value)
        )
        this.client.join(object)
    }
    run() {
        this.ui.element.classList.add('hidden')
        this.world = new World()
    }
    leave() {
        this.world && this.world.destroy()
        this.world = undefined
        this.setState('initializing')
        throw new Error('Method not implemented.')
    }
    error() {
        this.ui.element.classList.add('hidden')
        throw new Error('Method not implemented.')
    }

    private resize() {
        this.camera.resize()
        this.renderer.resize()
        this.world && this.world.resize()
    }

    private update() {
        this.camera.update()
        this.renderer.update()
        this.world && this.world.update()
    }
}

export default Experience
