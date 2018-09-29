import { shuffle } from '../shared/utils'

const INITIAL_HANDS = 5
const handsMap = {
  a: 0,
  b: 1,
  c: 2,
  d: 3,
  e: 4,
  f: 5,
  0: 'a',
  1: 'b',
  2: 'c',
  3: 'd',
  4: 'e',
  5: 'f'
}

export default class Game {
  constructor (playerCount = 4) {
    this.deck = Array.from(new Array(64), (v, i) => i + 1)
    this.playerCount = playerCount
    this.hands = {
      a: [],
      b: [],
      c: [],
      d: [],
      e: [],
      f: []
    }
    this.isClockwise = true
    this.shuffle()
    this.deal()
  }

  shuffle () {
    this.deck = shuffle(this.deck)
  }

  deal () {
    for (let i = 0; i < INITIAL_HANDS; i++) {
      for (let j = 0; j < this.playerCount; j++) {
        this.hands[handsMap[j]].push(this.deck[i * this.playerCount + j])
      }
    }
    this.deck = this.deck.slice(this.playerCount * INITIAL_HANDS)
  }
}
