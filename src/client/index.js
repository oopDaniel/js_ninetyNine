import io from 'socket.io-client'
import chalk from 'chalk'
import readline from 'readline'
import { PORT } from '../shared/constants'
import { getValue } from '../shared/utils'
import { render, renderAll } from './renderer'

const socket = io(`http://127.0.0.1:${PORT}`)
let id
let hasStarted = false

socket.on('canStart', handleCanStart)
socket.on('userConnected', (user) => console.log(`User ${user} joined the game.`))
socket.on('shouldStart', handleShouldStart)
socket.on('id', (newId) => (id = newId))
socket.on('gameStarted', handleStarted)
socket.on('deal', (newHands) => console.log('You got ', renderAll(newHands)))
socket.on('userDisconnected', () => console.log('An user left the game :('))
socket.on('played', handlePlayed)
socket.on('sum', sum => console.log(`Sum: ${chalk.blue(sum)}\n`))
socket.on('invalid', handleInvalid)
socket.on('askInstruction', handleInstruction)
socket.on('lose', handleLose)
socket.on('win', handleWin)
socket.on('yourTurn', handleTurn)

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

function handleCanStart () {
  rl.question(
    'We\'re connected. Wait for other players to join...\n(or you enter any word to start)\n',
    res => {
      if (res && !hasStarted) socket.emit('startGame')
    }
  )
}

function handleStarted () {
  console.log('\x1Bc')
  hasStarted = true
  console.log('\n------------------------\n\tGAME START!!\n------------------------\n')
}

function handleShouldStart () {
  rl.question('We\'re ready. Enter any word to start', () => {
    socket.emit('startGame')
  })
}

function handlePlayed ({ card, user, isRobot, target }) {
  console.log(chalk.magenta(`${isRobot ? 'Robot' : 'User'}_${user}`) + ` played ${render(card)}.`)
}

function handleTurn (hands) {
  rl.question(
    'Enter the number of card: \n' + hands.map((v, i) => `(${i + 1})${render(v)}`).join(' ') + '\n',
    res => {
      if ([1, 2, 3, 4, 5].includes(+res)) {
        socket.emit('play', hands[res - 1])
      }
    }
  )
}

function handleInvalid ({ card, hands }) {
  console.warn(`${render(card)} isn't a valid one.`)
  handleTurn(hands)
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
    console.warn(chalk.yellow('\n\n~~~~~~~~~~\nYou Lose!\n~~~~~~~~~~\n\n'))
  } else {
    console.log('\n~~~~~~~~~~')
    console.log(chalk.yellow(`${isRobot ? 'Robot' : 'User'}_${loseId} Loses!`))
    console.log('~~~~~~~~~~\n')
  }
}

function handleWin ({ id: winId, isRobot }) {
  console.log('\x1Bc')
  rl.close()
  if (winId === id) {
    console.warn(chalk.yellow('\n\n~~~~~~~~~~\nYou Win!\n~~~~~~~~~~\n\n'))
  } else {
    console.log('\n~~~~~~~~~~')
    console.log(chalk.yellow(`${isRobot ? 'Robot' : 'User'}_${winId} Wins!`))
    console.log('~~~~~~~~~~\n')
  }
}
