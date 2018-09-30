import R from 'ramda'
import { isFunctional, sample, getValue, hasValue, isMoreThanSum } from '../shared/utils'
import Robot from './robot/robot'

const isLessThanSum = sum => R.complement(isMoreThanSum(sum))

export default class UserProxy extends Robot {
  validate (game) {
    const options = R.filter(
      R.anyPass([
        R.compose(isLessThanSum(game.sum), getValue),
        isFunctional
      ])
    )(this.hands)
    if (!hasValue(options)) game.lose(this.id, this.hands)
  }

  play (game, card) {
    this.useCard(card, game)
    this.draw(game)
    game.continue()
    return game
  }

  useCard (card, game) {
    let next
    game.put(card)
    if (isFunctional(card)) {
      next = this.executeFunction(getValue(card), game)
    } else {
      this.accumulateSum(getValue(card), game)
    }
    this.hands = R.reject(v => v === card, this.hands)
    game.setNext(next) // Will calculate default next if passing undefined
  }

  executeFunction (num, game) {
    let customNext
    switch (num) {
      case 1: {
        game.reset()
        break
      }
      case 4: {
        game.reverse()
        break
      }
      case 5: {
        const options = R.reject(R.propEq('id', this.id), game.players)
        const next = sample(options)
        customNext = R.findIndex(R.propEq('id', next.id), game.players)
        break
      }
      case 10: {
        game.addOrReduce(10)
        break
      }
      case 11: {
        break
      }
      case 12: {
        game.addOrReduce(20)
        break
      }
      case 13: {
        game.to99()
        break
      }
    }
    return customNext
  }
}
