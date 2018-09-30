import io from 'socket.io-client'
import readline from 'readline'
import { PORT } from '../shared/constants'
import { getValue } from '../shared/utils'

const socket = io(`http://127.0.0.1:${PORT}`)
let id

socket.on('canStart', handleCanStart)
socket.on('userConnected', (user) => console.log(`User ${user} joined the game.`))
socket.on('shouldStart', handleShouldStart)
socket.on('id', (newId) => (id = newId))
socket.on('gameStarted', () => console.log('\n------------------------\n\tGAME START!!\n------------------------\n'))
socket.on('deal', (newHands) => console.log('You got ', newHands))
socket.on('userDisconnected', () => console.log('An user left the game :('))
socket.on('played', handlePlayed)
socket.on('sum', sum => console.log(`Sum: ${sum}\n`))
socket.on('invalid', handleInvalid)
socket.on('askInstruction', handleInstruction)
socket.on('lose', handleLose)
socket.on('win', () => console.log('\n\n\nYou Win!\n\n\n'))
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

function handlePlayed ({ card, user, isRobot, target }) {
  console.log(`<${isRobot ? 'Robot' : 'User'}_${user}> played [${getValue(card)}].`)
}

function handleTurn (hands) {
  rl.question(
    'Enter the number of card: \n' + hands.map((v, i) => `(${i + 1})${getValue(v)}`).join(' ') + '\n',
    res => {
      if ([1, 2, 3, 4, 5].includes(+res)) {
        console.log('(raw)', hands)
        socket.emit('play', hands[res - 1])
      }
    }
  )
}

function handleInvalid ({ card, hands }) {
  console.warn(`${getValue(card)} isn't a valid one.`)
  this.handleTurn(hands)
}

function handleInstruction ({ card, options = [] }) {
  const num = getValue(card)
  if (num === 10) {
    rl.question(
      '(1) +10 (2) -10\n',
      res => {
        if ([1, 2].includes(+res)) {
          socket.emit('instruct', {
            card,
            inst: +res
          })
        }
      }
    )
  } else if (num === 12) {
    rl.question(
      '(1) +20 (2) -20\n',
      res => {
        if ([1, 2].includes(+res)) {
          socket.emit('instruct', {
            card,
            inst: +res
          })
        }
      }
    )
  } else {
    rl.question(
      'Designate ' + options.map((o, i) => `(${i + 1}) ${o.name}`).join(' ') + '\n',
      res => {
        if (+res <= options.length && +res > 0) {
          console.log('emited inst')
          socket.emit('instruct', {
            card,
            inst: options[+res - 1].id
          })
        } else {
          console.log('why')
        }
      }
    )
  }
}

function handleLose ({ id: loseId, isRobot }) {
  if (loseId === id) {
    console.warn('\n\n~~~~~~~~~~\nYou Lose!\n~~~~~~~~~~\n\n')
  } else {
    console.log('\n~~~~~~~~~~')
    console.log(`${isRobot ? 'Robot' : 'User'}_${loseId} Loses!`)
    console.log('~~~~~~~~~~\n')
  }
}
