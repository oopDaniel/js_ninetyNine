import Robot from './robot'
import R from 'ramda'
import { isFunctional, hasValue, isMoreThanSum, maxNum, getValue } from '../../shared/utils'
import { MAX_SUM } from '../../shared/constants'

export default class SmartRobot extends Robot {
  // Instead of random picking, prioritizing some functional cards
  play (game) {
    let card = null
    // Functional card only
    if (game.sum === MAX_SUM) {
      const functionals = R.filter(isFunctional, this.hands)
      if (hasValue(functionals)) card = this.pickFunctional(functionals)
    } else {
      const options = R.reject(isMoreThanSum(game.sum), this.hands)
      if (hasValue(options)) {
        const functionless = R.reject(isFunctional, options)
        // Try to use a functionless card first unless having full functional cards
        card = R.ifElse(
          hasValue,
          maxNum,
          () => this.pickFunctional(options)
        )(functionless)
      }
    }

    if (card) {
      this.useCard(card, game)
      this.draw(game)
    } else {
      console.log('lose')
    }
    return card
  }

  pickFunctional (options) {
    const values = options.map(getValue)
    const priority = [10, 12, 13, 11, 5, 4, 1]
    for (let i = 0; i < priority.length; i++) {
      if (R.contains(priority[i], values)) {
        return options[R.findIndex(R.equals(priority[i]))]
      }
    }
  }

  executeFunction (num, game) {
    if (num === 5) {
      game.next()
    } else {
      super.executeFunction(num, game)
    }
  }
}
