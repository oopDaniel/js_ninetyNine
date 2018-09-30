import R from 'ramda'
import { shuffle, mod, isMoreThanSum, getValue } from '../shared/utils'
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
      console.log('user moved', payload)
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
    const options = R.compose(
      R.map(R.applySpec({
        id: R.prop('id'),
        name: R.ifElse(
          R.has('socket'),
          x => `User_${x.id}`,
          x => `Robot_${x.id}`
        )
      })),
      R.reject(R.propEq('id', id))
    )(this.players)
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
      current,
      next: (current + 1) % this.playerCount
    }
    console.log('after init turn:', this.turn)
  }

  start () {
    this.continue()
  }

  continue () {
    this.broadcast.emit('sum', this.sum)
    const curr = this.players[this.turn.current]
    if (curr.robot) {
      curr.robot.play(this)
    } else {
      curr.proxy.validate(this)
      curr.socket.emit('yourTurn', curr.proxy.hands)
    }
  }

  getNext (current = this.turn.next) {
    const index = this.isClockwise ? 1 : -1
    return mod(current + index, this.playerCount)
  }

  setNext (custom) {
    console.log('original: this.turn', this.turn.next, this.turn.current)
    do {
      const { next: current } = this.turn
      this.turn = {
        current: custom || current,
        next: this.getNext(custom)
      }
    } while (this.dead[this.turn.current])
    console.log('after changed: this.turn', this.turn)
  }

  announce (card) {
    const curr = this.players[this.turn.current]
    // const socket = this.players.filter(p => p.socket && p.id === curr.id)
    this.broadcast.emit('played', {
      card,
      user: curr.id,
      isRobot: curr.robot,
      target: this.turn.next
    })
    // socket.broadcast.emit()
    // socket.emit('played', {
    //   card,
    //   user: 'You',
    //   isRobot: false
    // })
  }

  put (cardOrCards) {
    if (Array.isArray(cardOrCards)) {
      this.deck.push(...cardOrCards) // happens when someone loses
    } else {
      console.log('this.turn.current', this.turn.current)
      console.log('===============================')
      console.log('put:', `[${getValue(cardOrCards)}]`, 'by', this.players[this.turn.current] && this.players[this.turn.current].id)
      console.log('===============================')
      this.announce(cardOrCards)
      this.deck.push(cardOrCards)
    }
  }

  draw () {
    return this.deck.unshift()
  }

  reverse () {
    this.isClockwise = !this.isClockwise
    this.turn.next = this.getNext(this.turn.current)
    console.log('reverse new turn', this.turn)
  }

  accumulate (num) {
    this.sum += num
    if (this.sum > MAX_SUM) throw Error('Sum exceeds 99, which shouldn\'t happen')
  }

  addSum (num) {
    this.sum += num
  }

  reduceSum (num) {
    console.warn(this)
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
      this.dead[index] = true
      console.log('putting hands back', hands)
      this.put(hands)
      this.shuffle()
      if (this.players.length - Object.keys(this.dead).length > 1) {
        this.setNext()
        this.continue()
      } else {
        this.announceWinner()
      }
    }
  }

  announceWinner () {
    const winner = this.players.find(p => !this.dead[p.id])
    winner.socket.emit('win')
  }
}
