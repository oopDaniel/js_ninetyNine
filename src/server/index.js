import socketIo from 'socket.io'
import { PORT, MAX_USERS } from '../shared/constants'
import Game from './game'
import { getRobot } from './robot'
const io = socketIo(PORT)

let hasGameStarted = false
let realUserCount = 0
let robotCount = 0
let robots = []
let players = []
let game = null

io.on('connection', (socket) => {
  realUserCount++
  players.push({
    id: socket.id,
    socket
  })

  console.log(`[Server]: A user just connected (total: ${realUserCount}).`)

  if (!hasGameStarted) {
    socket.broadcast.emit('userConnected', realUserCount)
    if (realUserCount === MAX_USERS) io.sockets.emit('shouldStart')
  }
  socket.emit('canStart')
  socket.on('startGame', handleStartGame)
  socket.on('play', handlePlay)
  socket.on('disconnect', handleDisconnect(socket))
})

function handleStartGame () {
  robotCount = MAX_USERS - realUserCount
  robots = Array.from(new Array(robotCount), (_, i) => getRobot(i))

  players = [
    ...players,
    ...robots.map((robot, id) => ({ id, robot }))
  ]

  io.sockets.emit('gameStarted', realUserCount)
  game = new Game(players, io.sockets)

  const userHands = game.hands.slice(0, realUserCount)
  userHands.forEach((h, i) => players[i].socket.emit('deal', h))

  if (robotCount > 0) {
    const robotHands = game.hands.slice(realUserCount, MAX_USERS)
    robots.forEach((r, i) => r.setHands(robotHands[i]))
  }

  // robots.forEach(r => console.info(r.hands))

  game.start()
}

function handlePlay (card) {
  console.log('user played card', card)
}

function handleDisconnect (socket) {
  return () => {
    realUserCount--
    const i = players.findIndex(s => s.id === socket.id)
    if (i > -1) players.splice(i, 1)
    if (players.every(p => p.robot)) {
      hasGameStarted = false
      players = []
    } else if (hasGameStarted) {
      socket.broadcast.emit('userDisconnected')
      game.lose(socket.id)
      // TODO: shuffle
    }
  }
}
