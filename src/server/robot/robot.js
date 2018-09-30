import R from 'ramda'
import { isFunctional, hasValue, sample, isLessThanSum, getValue } from '../../shared/utils'
import { MAX_SUM } from '../../shared/constants'

export default class Robot {
  constructor (id) {
    this.id = id
    this.hands = null
  }

  setHands (hands) {
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
      const options = R.filter(
        R.anyPass([
          R.compose(isLessThanSum(game.sum), getValue),
          isFunctional
        ])
      )(this.hands)
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
      game.continue()
    } else {
      console.log('\n~~~> This robot loses', 'id', this.id, 'hand', this.hands.map(getValue), '\n')
      game.lose(this.id, this.hands)
    }
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

  draw (game) {
    this.hands.push(game.draw())
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
        customNext = next.id
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

  accumulateSum (num, game) {
    game.accumulate(num)
  }
}
