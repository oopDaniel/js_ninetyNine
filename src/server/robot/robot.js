import R from 'ramda'
import { isFunctional, hasValue, sample, isMoreThanSum } from '../../shared/utils'
import { MAX_SUM } from '../../shared/constants'

export default class Robot {
  constructor (hands) {
    this.hands = hands
  }

  play (game) {
    let card = null
    // Functional card only
    if (game.sum === MAX_SUM) {
      const functionals = R.filter(isFunctional, this.hands)
      // Randomly pick a functional card
      if (hasValue(functionals)) card = sample(functionals)
    } else {
      const options = R.reject(isMoreThanSum(game.sum), this.hands)
      if (hasValue(options)) {
        const functionless = R.reject(isFunctional, options)
        // Try to use a functionless card first unless having full functional cards
        card = R.ifElse(
          hasValue,
          sample,
          () => sample(options)
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

  useCard (card, game) {
    R.ifElse(isFunctional, this.executeFunction, this.accumulateSum)(card)
    this.hands = R.reject(v => v === card, this.hands)
  }

  draw (game) {
    this.hands.push(game.draw())
  }

  executeFunction (card, game) {
    switch (card) {
      case 4: {
        game.reverse()
        break
      }
      case 5: {

      }
    }
  }

  accumulateSum () {

  }
}
