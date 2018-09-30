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
    console.log('* current', this.turn.current, this.turn.next)
  }

  start () {
    this.continue(null)
  }

  continue (caller) {
    this.broadcast.emit('sum', this.sum)
    console.warn({ caller })
    if (this.players[this.turn.current].robot) {
      this.players[this.turn.current].robot.play(this)
    } else {
      this.players[this.turn.current].socket.emit('yourTurn')
    }
  }

  getNext () {
    const { next: current } = this.turn
    const index = this.isClockwise ? 1 : -1
    return mod(current + index, this.playerCount)
  }

  setNext (customNext) {
    const { next: current } = this.turn
    console.log('---cal current', current)
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
    console.log('putt:', cardOrCards, 'by', this.players[this.turn.current].id, 'old sum', this.sum)
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
    this.players = R.reject(R.propEq('id', id), this.players)
    this.playerCount--
    this.put(hands)
    this.shuffle()
  }
}
