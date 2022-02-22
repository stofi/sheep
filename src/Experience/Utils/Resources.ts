import * as THREE from 'three'
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader'

import { EventEmitter } from '../../Utils/EventEmitter'

type AssetType = 'texture' | 'environmentTexture' | 'gltf'

export interface Asset {
    name: string
    type: AssetType
    path: string[]
}

type LoaderType = 'textureLoader' | 'glTFLoader' | 'cubeTextureLoader'
type Loader = GLTFLoader | THREE.CubeTextureLoader | THREE.TextureLoader
type ResoureceItem =
    | THREE.Texture
    | THREE.CubeTexture
    | THREE.Mesh
    | THREE.Material
    | GLTF

type Loaders = {
    [P in LoaderType]?: Loader
}

class Resources extends EventEmitter {
    sources: Asset[] = []
    items: { [key: string]: ResoureceItem } = {}
    toLoad: number
    loaded = 0
    loaders!: Loaders

    constructor(sources: Asset[]) {
        super()

        this.sources = sources
        this.toLoad = this.sources.length

        this.setLoaders()
        this.startLoading()
            .then(() => this.trigger('ready'))
            .catch((err) => this.trigger('error', err))
    }

    private setLoaders() {
        this.loaders = {}
        this.loaders.glTFLoader = new GLTFLoader()
        this.loaders.cubeTextureLoader = new THREE.CubeTextureLoader()
        this.loaders.textureLoader = new THREE.TextureLoader()
    }

    async startLoading() {
        for (const source of this.sources) {
            await new Promise<void>((resolve, reject) => {
                const onLoad = (item: ResoureceItem) => {
                    this.items[source.name] = item
                    this.loaded++
                    this.trigger('progress', this.loaded / this.toLoad)
                    resolve()
                }
                const onError = (err: ErrorEvent) => reject(err)

                if (!source.path || !source.path.length) {
                    reject(new Error('No path provided'))
                    return
                }

                switch (source.type) {
                    case 'texture':
                        // loadTexture
                        this.loaders.textureLoader?.load(
                            source.path[0] as string & string[],
                            onLoad,
                            undefined,
                            onError
                        )
                        break
                    case 'environmentTexture':
                        // loadEnvironmentTexture
                        this.loaders.cubeTextureLoader?.load(
                            source.path as string & string[],
                            onLoad,
                            undefined,
                            onError
                        )
                        break
                    case 'gltf':
                        // loadGltf
                        this.loaders.glTFLoader?.load(
                            source.path[0] as string & string[],
                            onLoad,
                            undefined,
                            onError
                        )
                        break
                }
            })
        }
    }
}

export default Resources
