import socketIo from 'socket.io'
// import { shuffle } from '../shared/utils'
import { PORT } from '../shared/constants'
import Game from './game'
const io = socketIo(PORT)
// const arr = [1, 2, 3, 4, 5, 6, 7]

// setInterval(() => console.info(shuffle(arr)), 3000)

const MAX_USERS = 4 // Use 4 to simplify logic for now
let hasGameStarted = false
let realUsers = 0
let robots = 0

io.on('connection', (socket) => {
  realUsers++
  console.log(`[Server]: A user just connected (total: ${realUsers}).`)

  if (!hasGameStarted) {
    socket.broadcast.emit('userConnected', realUsers)
    if (realUsers === MAX_USERS) io.sockets.emit('shouldStart')
  }
  socket.emit('canStart')
  socket.on('startGame', handleStartGame)
  socket.on('disconnect', handleDisconnect(socket))
})

function handleStartGame () {
  robots = MAX_USERS - realUsers
  io.sockets.emit('gameStarted', realUsers)
  const g = new Game()
  console.log(g.hands, g.deck, robots)
}

function handleDisconnect (socket) {
  return () => {
    realUsers--
    if (hasGameStarted) {
      socket.broadcast.emit('userDisconnected')
      // TODO: shuffle
    }
  }
}
