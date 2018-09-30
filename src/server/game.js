import R from 'ramda'
import { shuffle, mod, isMoreThanSum } from '../shared/utils'
import { MAX_SUM, MAX_PLAYERS } from '../shared/constants'

const INITIAL_HANDS = 5

export default class Game {
  constructor (players = [], broadcast) {
    if (players.length < 2) throw new Error('Need more players')
    this.broadcast = broadcast
    this.sum = 0
    this.deck = Array.from(new Array(53), (_, i) => i + 1)
    this.players = players
    this.playerCount = players.length
    this.isClockwise = true
    this.hands = null
    this.turn = null
    this.shuffle()
    this._initHands()
    this._deal()
    this._initTurn()
  }

  shuffle () {
    this.deck = shuffle(this.deck)
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

  getNext () {
    const { next: current } = this.turn
    const index = this.isClockwise ? 1 : -1
    return mod(current + index, this.playerCount)
  }

  setNext (customNext) {
    const { next: current } = this.turn
    this.turn = {
      current,
      next: customNext || this.getNext()
    }
  }

  announce (card) {
    const curr = this.players[this.turn.current]
    this.broadcast.emit('played', {
      card,
      user: curr.id,
      isRobot: curr.robot,
      target: this.turn.next,
      newSum: this.sum
    })
  }

  put (cardOrCards) {
    console.log('put:', cardOrCards, 'by', this.players[this.turn.current].id)
    if (Array.isArray(cardOrCards)) {
      this.deck.push(...cardOrCards) // happens when someone loses
    } else {
      this.announce(cardOrCards)
      this.deck.push(cardOrCards)
    }
  }

  draw () {
    return this.deck.unshift()
  }

  reverse () {
    this.isClockwise = !this.isClockwise
  }

  accumulate (num) {
    this.sum += num
    if (this.sum > MAX_SUM) throw Error('Sum exceeds 99, which shouldn\'t happen')
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
    const index = this.players.findIndex(R.propEq('id', id))
    if (index > -1 && this.players[index].socket) {
      this.players[index].socket.emit('lose', this.players[index].proxy.hands)
    }
    this.players = R.remove(index, 1, this.players)
    this.playerCount--
    this.put(hands)
    this.shuffle()
  }
}
