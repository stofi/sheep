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
            this.trigger('error', [{ error }])
        })
        this.onJoined()
        this.onPlayerMoved()
        this.onPlayerJoined()
        this.onPlayerLeft()
        this.onRecieveChat()
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

    chat(message: string) {
        logger('chat', message)
        this.socket.emit('chat', { message })
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
            this.trigger('playerJoined', [{ player: data.player }])
        })
    }

    onPlayerLeft() {
        this.socket.on('playerLeft', (data: { player: Player }) => {
            logger('onPlayerLeft', data)
            this.room!.players = this.room!.players.filter(
                (player) => player.id !== data.player.id
            )
            this.trigger('playerLeft', [{ id: data.player.id }])
        })
    }

    onPlayerMoved() {
        this.socket.on('playerMoved', (data: { player: Player }) => {
            logger('onPlayerMoved', data)

            if (!this.room?.players) return

            const player = this.room!.players.find(
                (player) => player.id === data.player.id
            )
            if (player) {
                player.x = data.player.x
                player.z = data.player.z
                player.thetaY = data.player.thetaY

                this.trigger('playerMoved', [
                    {
                        id: player.id,
                        x: player.x,
                        z: player.z,
                        thetaY: player.thetaY,
                    },
                ])
            }
        })
    }

    onRecieveChat() {
        this.socket.on(
            'playerChat',
            (data: { player: Player; message: string }) => {
                logger('onRecieveChat', data)
                console.log(data)

                this.trigger('playerChat', [
                    {
                        id: data.player.id,
                        message: data.message,
                    },
                ])
            }
        )
    }
}

export default Client
