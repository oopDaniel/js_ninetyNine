import R from 'ramda'
import { shuffle, mod, isMoreThanSum } from '../shared/utils'
import { MAX_SUM, MAX_PLAYERS } from '../shared/constants'

const INITIAL_HANDS = 5

export default class Game {
  constructor (players = [], broadcast) {
    if (players.length < 2) throw new Error('Need more players')
    this.broadcast = broadcast
    this.sum = 0
    this.deck = Array.from(new Array(52), (_, i) => i + 1)
    this.players = players
    this.playerCount = players.length
    this.isClockwise = true
    this.hands = null
    this.turn = null
    this.dead = {}
    this.hasFinished = false
    this.shuffle()
    this._initHands()
    this._deal()
    this._initTurn()
  }

  shuffle () {
    this.deck = shuffle(this.deck)
  }

  getUserById (id) {
    return this.players.find(p => p.id === id)
  }

  userMove (id, payload, isInstruction = false) {
    const player = this.getUserById(id)
    if (isInstruction) {
      player.proxy.setInstruction(this, payload)
    } else {
      player.proxy.useCard(this, payload)
    }
  }

  warnUser (id, card, hands) {
    const player = this.getUserById(id)
    player.socket.emit('invalid', { card, hands })
  }

  askForInstruction (id, card) {
    const player = this.getUserById(id)
    const options = R.map(R.applySpec({
      id: R.prop('id'),
      name: R.ifElse(
        R.has('socket'),
        x => `User_${x.id}`,
        x => `Robot_${x.id}`
      )
    }))(this.players.filter(
      R.allPass([
        p => p.id !== id,
        p => !this.dead[p.id]
      ])
    ))
    player.socket.emit('askInstruction', { card, options })
  }

  /**
   * Get this [ [], [], [], [] ]
   */
  _initHands () {
    const possiblePlayers = new Array(MAX_PLAYERS)
    this.hands = R.compose(
      R.map(() => []),
      R.slice(0, this.playerCount)
    )(possiblePlayers)
  }

  _deal () {
    for (let i = 0; i < INITIAL_HANDS; i++) {
      for (let j = 0; j < this.playerCount; j++) {
        this.hands[j].push(this.deck[i * this.playerCount + j])
      }
    }
    this.deck = this.deck.slice(this.playerCount * INITIAL_HANDS)
  }

  _initTurn () {
    const current = ~~(Math.random() * this.playerCount)
    this.turn = {
      current: this.players[current].id,
      next: this.players[(current + 1) % this.playerCount].id
    }
  }

  start () {
    this.continue()
  }

  continue () {
    this.broadcast.emit('sum', this.sum)
    const curr = this.getUserById(this.turn.current)
    if (curr.robot) {
      curr.robot.play(this)
    } else {
      curr.proxy.validate(this)
      curr.socket.emit('yourTurn', curr.proxy.hands)
    }
  }

  getNext (current = this.turn.next) {
    const index = this.players.findIndex(p => p.id === current)
    const offset = this.isClockwise ? 1 : -1
    const newIndex = mod(index + offset, this.playerCount)
    return this.players[newIndex].id
  }

  setNext (custom) {
    const { next: current } = this.turn
    this.turn = {
      current: custom || current,
      next: this.getNext(custom || current)
    }
  }

  announce (card) {
    const curr = this.getUserById(this.turn.current)
    this.broadcast.emit('played', {
      card,
      user: curr.id,
      isRobot: curr.robot,
      target: this.turn.next
    })
  }

  put (cardOrCards) {
    if (Array.isArray(cardOrCards)) {
      this.deck.push(...cardOrCards) // happens when someone loses
    } else {
      // console.log('===============================')
      // console.log('Put:', `[${getValue(cardOrCards)}]`, `(by: ${this.turn.current})`)
      // console.log('===============================')
      this.announce(cardOrCards)
      this.deck.push(cardOrCards)
    }
  }

  draw () {
    return this.deck.shift()
  }

  reverse () {
    this.isClockwise = !this.isClockwise
    this.turn.next = this.getNext(this.turn.current)
  }

  accumulate (num) {
    this.sum += num
    if (this.sum > MAX_SUM) throw Error('Sum exceeds 99, which shouldn\'t happen')
  }

  addSum (num) {
    this.sum += num
  }

  reduceSum (num) {
    this.sum -= num
  }

  addOrReduce (num) {
    this.sum = R.ifElse(
      isMoreThanSum(this.sum),
      R.subtract(this.sum),
      R.add(this.sum)
    )(num)
  }

  reset () {
    this.sum = 0
    this.shuffle()
  }

  to99 () {
    this.sum = 99
  }

  lose (id, hands) {
    const player = this.getUserById(id)
    this.broadcast.emit('lose', {
      id: player.id,
      isRobot: player.robot
    })
    const index = this.players.findIndex(R.propEq('id', id))
    if (index > -1) {
      this.players = R.remove(index, 1, this.players)
      this.playerCount--
      this.dead[id] = true
      this.put(hands)
      this.shuffle()
      if (this.players.length !== 1) {
        this.setNext()
        this.continue()
      } else {
        this.announceWinner()
      }
    }
  }

  announceWinner () {
    this.hasFinished = true
    const winner = this.players[0]
    this.broadcast.emit('win', {
      id: winner.id,
      isRobot: winner.robot
    })
  }
}
