import io from 'socket.io-client'
import readline from 'readline'
import { PORT } from '../shared/constants'

const socket = io(`http://127.0.0.1:${PORT}`)

socket.on('canStart', handleCanStart)
socket.on('userConnected', (user) => console.log(`User ${user} joined the game.`))
socket.on('shouldStart', handleShouldStart)
socket.on('gameStarted', () => console.log('START!!'))
socket.on('userDisconnected', () => console.log('An user left the game :('))

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function handleCanStart () {
  rl.question(
    'We\'re connected. Wait for other players to join...\n(or you enter any word to start)\n',
    res => {
      if (res) socket.emit('startGame')
      rl.close()
    }
  )
}

function handleShouldStart () {
  rl.question('We\'re ready. Enter any word to start', () => socket.emit('startGame'))
}
