import socketIo from 'socket.io'
import { PORT } from '../shared/constants'
import Game from './game'
import { getRobot } from './robot'
const io = socketIo(PORT)

const MAX_USERS = 4 // Use 4 to simplify logic for now
let hasGameStarted = false
let realUserCount = 0
let robotCount = 0
let robots

io.on('connection', (socket) => {
  realUserCount++
  console.log(`[Server]: A user just connected (total: ${realUserCount}).`)

  if (!hasGameStarted) {
    socket.broadcast.emit('userConnected', realUserCount)
    if (realUserCount === MAX_USERS) io.sockets.emit('shouldStart')
  }
  socket.emit('canStart')
  socket.on('startGame', handleStartGame)
  socket.on('disconnect', handleDisconnect(socket))
})

function handleStartGame () {
  robotCount = MAX_USERS - realUserCount
  io.sockets.emit('gameStarted', realUserCount)
  const game = new Game()
  console.info(game.hands)
  const userHands = game.hands.slice(0, realUserCount)
  userHands.forEach(h => io.sockets.emit('deal', h))
  if (robotCount > 0) {
    const robotHands = game.hands.slice(realUserCount, MAX_USERS)
    robots = Array.from(new Array(robotCount), (_, i) => getRobot(robotHands[i]))
  }
  robots.forEach(r => console.info(r))
  // console.log(robots)
}

function handleDisconnect (socket) {
  return () => {
    realUserCount--
    if (hasGameStarted) {
      socket.broadcast.emit('userDisconnected')
      // TODO: shuffle
    }
  }
}
