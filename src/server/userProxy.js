import R from 'ramda'
import { isFunctional, getValue, hasValue, isLessThanSum } from '../shared/utils'
import Robot from './robot/robot'

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
    // game.continue()
  }

  useCard (game, card) {
    if (isFunctional(card)) {
      console.log('isfunctional', card)
      this.executeFunction(card, game)
    } else {
      console.log('not functional ', card)
      this.accumulateSum(card, game)
    }
  }

  doPostActions (card, game, next) {
    this.hands = R.reject(v => v === card, this.hands)
    game.setNext(next) // Will calculate default next if passing undefined
    console.log('this hand length b4 draw', this.hands.length)
    this.draw(game)
    console.log('this hand length', this.hands.length)
    game.continue()
  }

  setInstruction (game, { card, inst }) {
    console.log('set ins', card, inst)
    let index
    const num = getValue(card)
    if (num === 5) {
      index = R.findIndex(R.propEq('id', inst), game.players)
      console.log('player index', index, game.players)
    } else {
      const func = inst === 1 ? game.addSum : game.reduceSum
      func.call(game, num === 10 ? 10 : 20)
    }
    this.doPostActions(card, game, index)
  }

  executeFunction (card, game) {
    game.put(card)
    const num = getValue(card)
    let isWaiting = false
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
        isWaiting = true
        break
      }
      case 10: {
        if (game.sum < 10) {
          game.addSum(10)
        } else if (game.sum > 89) {
          game.reduceSum(10)
        } else {
          isWaiting = true
        }
        break
      }
      case 11: {
        break
      }
      case 12: {
        if (game.sum < 20) {
          game.addSum(20)
        } else if (game.sum > 79) {
          game.reduceSum(20)
        } else {
          isWaiting = true
        }
        break
      }
      case 13: {
        game.to99()
        break
      }
    }
    if (isWaiting) {
      game.askForInstruction(this.id, card)
    } else {
      this.doPostActions(card, game)
    }
  }

  accumulateSum (card, game) {
    const num = getValue(card)
    if (isLessThanSum(game.sum)(num)) {
      game.put(card)
      super.accumulateSum(num, game)
      this.doPostActions(card, game)
    } else {
      game.warnUser(this.id, card, this.hands)
    }
  }
}
