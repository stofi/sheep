import { io } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

import { EventEmitter } from '../Utils/EventEmitter'

// incoming events:
// error
// joined
// playerJoined
// playerLeft
// playerMoved

// outgoing events:
// join {roomId, roomPassword, playerName, color}
// move {x, z, thetaY}
// leave

interface Player {
    id: string
    name: string
    color: string
    x: number
    z: number
    thetaY: number
}

interface Room {
    id: string
    password: string
    players: Player[]
}

interface JoinData {
    roomId: string
    playerName: string
    password: string
    color: string
    roomPassword: string
}

const ENABLE_LOG = false
const logger = (...args: any[]) => {
    ENABLE_LOG && console.log(...args)
}

class Client extends EventEmitter {
    socket: Socket
    connected = false
    room?: Room
    player?: Player
    constructor(url: string) {
        super()
        this.socket = io(url)
        this.socket.on('connect', () => {
            this.connected = true
        })
        this.socket.on('disconnect', () => {
            this.connected = false
        })
        this.socket.on('error', (error: Error) => {
            console.error(error)
        })
        this.onJoined()
        this.onPlayerMoved()
        this.onPlayerJoined()
        this.onPlayerLeft()
    }

    join({ roomId, roomPassword, playerName, color }: JoinData) {
        logger('join', roomId, roomPassword, playerName, color)
        this.socket.emit('join', { playerName, roomId, roomPassword, color })
    }

    move(x: number, z: number, thetaY: number) {
        // logger('move', x, z, thetaY)
        this.socket.emit('move', { x, z, thetaY })
    }

    leave() {
        logger('leave')
        this.socket.emit('leave')
    }

    onJoined() {
        this.socket.on('joined', (data: { room: Room; player: Player }) => {
            logger('joined', data.room, data.player)
            this.room = data.room
            this.player = data.player

            this.trigger('joined')
        })
    }

    onPlayerJoined() {
        this.socket.on('playerJoined', (data: { player: Player }) => {
            logger('onPlayerJoined', data)
            this.room!.players.push(data.player)
            this.trigger('update')
        })
    }

    onPlayerLeft() {
        this.socket.on('playerLeft', (data: { playerId: string }) => {
            logger('onPlayerLeft', data)
            this.room!.players = this.room!.players.filter(
                (player) => player.id !== data.playerId
            )
            this.trigger('update')
        })
    }

    onPlayerMoved() {
        this.socket.on('playerMoved', (data: { player: Player }) => {
            logger('onPlayerMoved', data)

            const player = this.room!.players.find(
                (player) => player.id === data.player.id
            )
            if (player) {
                player.x = data.player.x
                player.z = data.player.z
                player.thetaY = data.player.thetaY

                this.trigger('playerMoved', player)
            }
            this.trigger('update')
        })
    }
}

export default Client
