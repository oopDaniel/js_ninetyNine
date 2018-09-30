import io from 'socket.io-client'
import readline from 'readline'
import { PORT } from '../shared/constants'
import { getValue } from '../shared/utils'

const socket = io(`http://127.0.0.1:${PORT}`)
let hands
socket.on('canStart', handleCanStart)
socket.on('userConnected', (user) => console.log(`User ${user} joined the game.`))
socket.on('shouldStart', handleShouldStart)
socket.on('gameStarted', () => console.log('---START!!---'))
socket.on('deal', (newHands) => {
  hands = newHands
  console.log('You got ', newHands)
})
socket.on('userDisconnected', () => console.log('An user left the game :('))
socket.on('played', handlePlayed)
socket.on('sum', sum => console.log(`Sum: ${sum}\n`))
socket.on('yourTurn', handleTurn)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function handleCanStart () {
  rl.question(
    'We\'re connected. Wait for other players to join...\n(or you enter any word to start)\n',
    res => {
      if (res) socket.emit('startGame')
    }
  )
}

function handleShouldStart () {
  rl.question('We\'re ready. Enter any word to start', () => {
    socket.emit('startGame')
  })
}

function handlePlayed ({ card, user, isRobot, target, newSum }) {
  console.log(`${isRobot ? 'Robot' : 'User'}_${user} played ${card}.`)
}

function handleTurn () {
  rl.question(
    'Enter the number of card: \n' + hands.map((v, i) => `(${i + 1})${getValue(v)}`).join(' ') + '\n',
    res => {
      console.log('ress', res)
      if ([1, 2, 3, 4, 5].includes(+res)) {
        console.log('good')
        socket.emit('play', hands[res - 1])
      } else {
        console.log('Enter the number of card: \n', hands.map((v, i) => `(${i + 1})${v}`).join(' '))
      }
    }
  )
}
