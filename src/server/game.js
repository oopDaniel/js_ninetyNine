import R from 'ramda'
import { shuffle } from '../shared/utils'

const INITIAL_HANDS = 5

export default class Game {
  constructor (playerCount = 4) {
    this.sum = 0
    this.deck = Array.from(new Array(53), (_, i) => i + 1)
    this.playerCount = playerCount
    this.isClockwise = true
    this.shuffle()
    this._initHands(playerCount)
    this._deal()
  }

  shuffle () {
    this.deck = shuffle(this.deck)
  }

  /**
   * Get this [ [], [], [], [] ]
   */
  _initHands (playerCount) {
    const possiblePlayers = [0, 1, 2, 3, 4, 5]
    this.hands = R.compose(
      R.map(() => []),
      R.slice(0, playerCount)
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

  put (cardOrCards) {
    if (Array.isArray(cardOrCards)) this.deck.push(...cardOrCards)
    else this.deck.push(cardOrCards)
  }

  draw () {
    return this.deck.unshift()
  }

  reverse () {
    this.isClockwise = !this.isClockwise
  }

  accumulate (num) {
    this.sum += num
    if (this.sum > 99) throw Error('Sum exceeds 99, which shouldn\'t happen')
  }

  reset () {
    this.sum = 0
    this.shuffle()
  }
}
